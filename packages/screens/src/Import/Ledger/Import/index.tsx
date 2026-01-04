// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as Icons from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import * as Styles from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import {
  useConnections,
  useDialogControl,
  useImportAddresses,
  useImportHandler,
  useLedgerHardware,
} from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { ItemsColumn } from '@polkadot-live/styles';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ConnectButton } from './Wrappers';
import { DialogShowAddress } from '../../Addresses/Dialogs';
import { AddressListFooter, ImportAddressRow } from '../../Wrappers';
import { determineStatusFromCode } from './Utils';
import { getSelectLedgerNetworkData } from '@polkadot-live/consts/chains';
import type { ImportProps } from './types';
import type { ChainID } from '@polkadot-live/types/chains';

export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
  const { cacheGet, copyToClipboard, getTheme } = useConnections();
  const { handleImportAddress } = useImportHandler();
  const { getShowAddressDialogData, setShowAddressDialogData } =
    useDialogControl();

  const { isAlreadyImported, getAccounts, getNextNames } = useImportAddresses();
  const genericAccounts = getAccounts('ledger');

  const ledger = useLedgerHardware();
  const { connectedNetwork, selectedAddresses, receivedAddresses } =
    useLedgerHardware();

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] = useState<string[]>([
    'connect-ledger',
    'import-accounts',
  ]);

  const [showConnectStatus, setShowConnectStatus] = useState(false);
  const darkMode = cacheGet('mode:dark');
  const theme = getTheme();

  /**
   * Handle a checkbox click to add and remove selected addresses.
   * An initial account name is assigned.
   */
  const handleCheckboxClick = (
    checkState: Checkbox.CheckedState,
    pk: string,
    accountName: string
  ) => {
    ledger.updateSelectedAddresses(
      typeof checkState === 'string' ? false : Boolean(checkState),
      pk,
      accountName
    );
  };

  /**
   * Interact with Ledger device and perform necessary tasks.
   */
  const handleGetLedgerAddresses = async (
    changingPage: boolean,
    targetIndex = 0
  ) => {
    const selected = ledger.selectedNetworkState;
    if (selected === '') {
      setShowConnectStatus(true);
      return;
    }
    const offset = !changingPage ? 0 : targetIndex * 5;

    // Use the connected network if we're changing page. Otherwise, use the selected network.
    const network = (
      changingPage
        ? connectedNetwork === ''
          ? selected
          : connectedNetwork
        : selected
    ) as ChainID;

    await ledger.fetchLedgerAddresses(network, offset);
  };

  /**
   * Handle importing the selected Ledger addresses.
   */
  const handleImportProcess = async () => {
    if (selectedAddresses.length === 0) {
      return;
    }
    ledger.setIsImporting(true);
    const accountNames = getNextNames(selectedAddresses.length);

    let i = 0;
    for (const selected of selectedAddresses) {
      const { address, ledgerMeta } = selected;

      if (isAlreadyImported(ledger.getPublicKey(address))) {
        continue;
      }
      const accountName = accountNames[i];
      const toast = accountNames.length === 1;
      const source = 'ledger';
      await handleImportAddress(
        address,
        source,
        accountName,
        ledgerMeta,
        toast
      );

      i += 1;
    }
    ledger.resetAll();
    setShowImportUi(false);
  };

  /**
   * Handle clicks for pagination buttons.
   */
  const handlePaginationClick = async (direction: 'prev' | 'next') => {
    const targetIndex =
      direction === 'prev'
        ? Math.max(0, ledger.pageIndex - 1)
        : Math.max(0, ledger.pageIndex + 1);

    ledger.setPageIndex(targetIndex);
    await handleGetLedgerAddresses(true, targetIndex);
  };

  /**
   * Update flag to show error/status messages.
   */
  useEffect(() => {
    if (ledger.lastStatusCode !== null) {
      setShowConnectStatus(true);
    }
  }, [ledger.lastStatusCode]);

  return (
    <>
      {(ledger.isFetching || ledger.isImporting) && (
        <BarLoader
          color={darkMode ? '#642763' : '#a772a6'}
          width={'100%'}
          height={2}
          cssOverride={{ position: 'fixed', top: '82px', zIndex: 99 }}
          speedMultiplier={0.75}
        />
      )}

      {getShowAddressDialogData().address && (
        <DialogShowAddress address={getShowAddressDialogData().address!} />
      )}

      <Styles.PadWrapper>
        <Styles.FlexColumn $rowGap={'1.75rem'}>
          <section>
            <UI.ActionItem showIcon={false} text={'Ledger Accounts'} />
            {/** Breadcrump */}
            <UI.ControlsWrapper
              $padWrapper={true}
              $padBottom={false}
              style={{ padding: '1rem 0 0 0' }}
            >
              <Styles.ResponsiveRow $smWidth="450px">
                <Styles.FlexRow>
                  <UI.ButtonPrimaryInvert
                    className="back-btn"
                    text="Back"
                    iconLeft={FA.faCaretLeft}
                    onClick={() => {
                      ledger.clearCaches(false, false, true);
                      setShowImportUi(genericAccounts.length === 0);
                      setSection(0);
                    }}
                  />
                  <UI.SortControlLabel label="Import Ledger Accounts" />
                </Styles.FlexRow>
                <Styles.FlexRow>
                  <UI.ButtonText
                    iconLeft={FA.faCaretRight}
                    text={'Ledger Accounts'}
                    disabled={genericAccounts.length === 0}
                    onClick={() => {
                      ledger.clearCaches(false, false, true);
                      setShowImportUi(false);
                    }}
                  />
                </Styles.FlexRow>
              </Styles.ResponsiveRow>
            </UI.ControlsWrapper>
          </section>

          <section>
            <UI.AccordionWrapper $onePart={true}>
              <Accordion.Root
                className="AccordionRoot"
                type="multiple"
                value={accordionValue}
                onValueChange={(val) => setAccordionValue(val as string[])}
              >
                <Styles.FlexColumn>
                  {/** Choose Network */}
                  <Accordion.Item
                    className="AccordionItem"
                    value={'connect-ledger'}
                  >
                    <UI.AccordionTrigger narrow={true}>
                      <Icons.ChevronDownIcon
                        className="AccordionChevron"
                        aria-hidden
                      />
                      <UI.TriggerHeader>Connect Ledger</UI.TriggerHeader>
                    </UI.AccordionTrigger>
                    <UI.AccordionContent transparent={true}>
                      <Styles.FlexRow>
                        <Select.Root
                          value={ledger.selectedNetworkState}
                          onValueChange={(val) =>
                            ledger.setSelectedNetwork(val)
                          }
                        >
                          <UI.SelectTrigger $theme={theme} aria-label="Network">
                            <Select.Value placeholder="Select Network" />
                            <Select.Icon className="SelectIcon">
                              <Icons.ChevronDownIcon />
                            </Select.Icon>
                          </UI.SelectTrigger>
                          <Select.Portal>
                            <UI.SelectContent
                              $theme={theme}
                              position="popper"
                              sideOffset={3}
                            >
                              <Select.ScrollUpButton className="SelectScrollButton">
                                <Icons.ChevronUpIcon />
                              </Select.ScrollUpButton>
                              <Select.Viewport className="SelectViewport">
                                <Select.Group>
                                  {getSelectLedgerNetworkData().map(
                                    ({ network, ledgerId, iconWidth }) => (
                                      <UI.SelectItem
                                        key={ledgerId}
                                        value={network}
                                      >
                                        <div className="innerRow">
                                          <div>
                                            <UI.ChainIcon
                                              chainId={network as ChainID}
                                              width={iconWidth}
                                            />
                                          </div>
                                          <div>{network}</div>
                                        </div>
                                      </UI.SelectItem>
                                    )
                                  )}
                                </Select.Group>
                              </Select.Viewport>
                              <Select.ScrollDownButton className="SelectScrollButton">
                                <Icons.ChevronDownIcon />
                              </Select.ScrollDownButton>
                            </UI.SelectContent>
                          </Select.Portal>
                        </Select.Root>

                        {/** Connect Button */}
                        <ConnectButton
                          onClick={async () => {
                            ledger.setPageIndex(0);
                            await handleGetLedgerAddresses(false);
                          }}
                          disabled={ledger.disableConnect()}
                        >
                          Connect
                        </ConnectButton>
                      </Styles.FlexRow>

                      {/** Error and Status Messages */}
                      {showConnectStatus && !ledger.deviceConnected && (
                        <UI.InfoCard
                          kind={'warning'}
                          icon={FA.faExclamationTriangle}
                        >
                          <span>
                            {
                              determineStatusFromCode(
                                ledger.lastStatusCode,
                                false
                              ).title
                            }
                          </span>
                          <button
                            className="dismiss"
                            onClick={() => setShowConnectStatus(false)}
                          >
                            <FontAwesomeIcon icon={FA.faX} />
                          </button>
                        </UI.InfoCard>
                      )}

                      {showConnectStatus &&
                        ledger.selectedNetworkState === '' && (
                          <UI.InfoCard
                            kind={'warning'}
                            icon={FA.faExclamationTriangle}
                          >
                            <span>Select a network.</span>
                          </UI.InfoCard>
                        )}

                      <UI.InfoCardSteps style={{ marginTop: '0.75rem' }}>
                        <span>
                          Connect a Ledger device to this computer with a USB
                          cable.
                        </span>
                        <span>
                          Unlock the Ledger device and open the Polkadot app.
                        </span>
                        <span>
                          Select a network above and click on the <b>Connect</b>{' '}
                          button.
                        </span>
                      </UI.InfoCardSteps>
                    </UI.AccordionContent>
                  </Accordion.Item>

                  {/** Import Addresses */}
                  <Accordion.Item
                    className="AccordionItem"
                    value={'import-accounts'}
                  >
                    <UI.AccordionTrigger narrow={true}>
                      <Icons.ChevronDownIcon
                        className="AccordionChevron"
                        aria-hidden
                      />
                      <UI.TriggerHeader>Import Accounts</UI.TriggerHeader>
                    </UI.AccordionTrigger>
                    <UI.AccordionContent transparent={true}>
                      {!ledger.deviceConnected ? (
                        <UI.InfoCard
                          icon={FA.faCircleDot}
                          iconTransform={'shrink-3'}
                          style={{ marginTop: '0', marginBottom: '0.75rem' }}
                        >
                          <span>
                            Connect a Ledger device to view its addresses.
                          </span>
                        </UI.InfoCard>
                      ) : (
                        <>
                          <ItemsColumn>
                            {receivedAddresses.map(({ address }, i) => {
                              const pubKey = ledger.getPublicKey(address);

                              return (
                                <ImportAddressRow key={address}>
                                  <div className="identicon">
                                    <UI.Identicon
                                      value={address}
                                      fontSize={'2.5rem'}
                                    />
                                  </div>
                                  <div className="addressInfo">
                                    <h2>
                                      {connectedNetwork} Ledger Account{' '}
                                      {ledger.pageIndex * 5 + i + 1}
                                    </h2>
                                    <Styles.FlexRow $gap={'0.6rem'}>
                                      <span className="address">
                                        {ellipsisFn(address, 12)}
                                      </span>
                                      <span>
                                        <UI.CopyButton
                                          iconFontSize="1rem"
                                          theme={theme}
                                          onCopyClick={async () =>
                                            await copyToClipboard(address)
                                          }
                                        />
                                      </span>
                                      <UI.ViewAddressIcon
                                        theme={theme}
                                        onClick={() =>
                                          setShowAddressDialogData({
                                            address,
                                            isOpen: true,
                                          })
                                        }
                                      />
                                    </Styles.FlexRow>
                                  </div>
                                  <div className="right">
                                    {isAlreadyImported(pubKey) ? (
                                      <span className="imported">Imported</span>
                                    ) : (
                                      <Styles.CheckboxRoot
                                        $theme={theme}
                                        className="CheckboxRoot"
                                        id={`c${i}`}
                                        checked={ledger.getChecked(pubKey)}
                                        disabled={ledger.isFetching}
                                        onCheckedChange={(
                                          checked: Checkbox.CheckedState
                                        ) =>
                                          handleCheckboxClick(
                                            checked,
                                            pubKey,
                                            `${connectedNetwork} Ledger Account ${ledger.pageIndex * 5 + i + 1}`
                                          )
                                        }
                                      >
                                        <Checkbox.Indicator className="CheckboxIndicator">
                                          <Icons.CheckIcon />
                                        </Checkbox.Indicator>
                                      </Styles.CheckboxRoot>
                                    )}
                                  </div>
                                </ImportAddressRow>
                              );
                            })}
                          </ItemsColumn>

                          <AddressListFooter>
                            <button
                              className="pageBtn"
                              disabled={
                                ledger.pageIndex === 0 || ledger.isFetching
                              }
                              onClick={() => handlePaginationClick('prev')}
                            >
                              <Icons.CaretLeftIcon />
                            </button>
                            <button
                              className="pageBtn"
                              disabled={ledger.isFetching}
                              onClick={() => handlePaginationClick('next')}
                            >
                              <Icons.CaretRightIcon />
                            </button>
                            <div className="importBtn">
                              <button
                                disabled={
                                  selectedAddresses.length === 0 ||
                                  ledger.isFetching ||
                                  ledger.isImporting
                                }
                                onClick={async () =>
                                  await handleImportProcess()
                                }
                              >
                                {ledger.getImportLabel()}
                              </button>
                            </div>
                          </AddressListFooter>
                        </>
                      )}
                    </UI.AccordionContent>
                  </Accordion.Item>
                </Styles.FlexColumn>
              </Accordion.Root>
            </UI.AccordionWrapper>
          </section>
        </Styles.FlexColumn>
      </Styles.PadWrapper>
    </>
  );
};
