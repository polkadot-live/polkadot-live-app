// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';

import { useEffect, useState } from 'react';
import { useConnections } from '@ren/contexts/common';
import {
  useAddresses,
  useImportHandler,
  useLedgerHardware,
} from '@ren/contexts/import';

import { ChainIcon, InfoCard } from '@polkadot-live/ui/components';
import {
  ButtonPrimaryInvert,
  ButtonText,
} from '@polkadot-live/ui/kits/buttons';
import { BarLoader } from 'react-spinners';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@radix-ui/react-icons';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretLeft,
  faCaretRight,
  faCircleDot,
  faExclamationTriangle,
  faX,
} from '@fortawesome/free-solid-svg-icons';
import { ConnectButton } from './Wrappers';
import { AddressListFooter, ImportAddressRow } from '../../Wrappers';
import { InfoCardSteps } from '../../InfoCardSteps';
import { determineStatusFromCodes } from './Utils';
import { ItemsColumn } from '@ren/screens/Home/Manage/Wrappers';
import { getSelectNetworkData } from '@polkadot-live/consts/chains';
import type { ImportProps } from './types';
import type { ChainID } from '@polkadot-live/types/chains';

export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
  const { cacheGet, getTheme } = useConnections();
  const { handleImportAddress } = useImportHandler();
  const { isAlreadyImported, getAccounts, getDefaultName } = useAddresses();
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
  const handleGetLedgerAddresses = (changingPage: boolean, targetIndex = 0) => {
    const selected = ledger.selectedNetworkState;

    if (selected === '') {
      setShowConnectStatus(true);
      return;
    }

    const offset = !changingPage ? 0 : targetIndex * 5;

    // Use the connected network if we're changing page. Otherwise, use the selected network.
    const network = changingPage
      ? connectedNetwork === ''
        ? selected
        : connectedNetwork
      : selected;

    ledger.fetchLedgerAddresses(network, offset);
  };

  /**
   * Handle importing the selected Ledger addresses.
   */
  const handleImportProcess = async () => {
    if (selectedAddresses.length === 0) {
      return;
    }

    ledger.setIsImporting(true);

    const accountNames: string[] = [];
    let n = parseInt(getDefaultName().split('').pop()!);
    Array.from({ length: selectedAddresses.length }, () => {
      accountNames.push(`Account ${n}`);
      n += 1;
    });

    let i = 0;
    for (const selected of selectedAddresses) {
      const { address: add, pubKey: pk, device } = selected;

      if (isAlreadyImported(pk)) {
        continue;
      }

      const accountName = accountNames[i];
      const toast = accountNames.length === 1;
      const s = 'ledger';
      await handleImportAddress(add, s, false, accountName, device, toast);
      i += 1;
    }

    ledger.resetAll();
    setShowImportUi(false);
  };

  /**
   * Handle clicks for pagination buttons.
   */
  const handlePaginationClick = (direction: 'prev' | 'next') => {
    const targetIndex =
      direction === 'prev'
        ? Math.max(0, ledger.pageIndex - 1)
        : Math.max(0, ledger.pageIndex + 1);

    ledger.setPageIndex(targetIndex);
    handleGetLedgerAddresses(true, targetIndex);
  };

  /**
   * Update flag to show error/status messages.
   */
  useEffect(() => {
    if (ledger.statusCodes.length > 0) {
      setShowConnectStatus(true);
    }
  }, [ledger.statusCodes]);

  return (
    <UI.ScrollableMax>
      {(ledger.isFetching || ledger.isImporting) && (
        <BarLoader
          color={darkMode ? '#642763' : '#a772a6'}
          width={'100%'}
          height={2}
          cssOverride={{ position: 'fixed', top: 0, zIndex: 99 }}
          speedMultiplier={0.75}
        />
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
                  <ButtonPrimaryInvert
                    className="back-btn"
                    text="Back"
                    iconLeft={faCaretLeft}
                    onClick={() => {
                      ledger.clearCaches(false, false, true);
                      setShowImportUi(genericAccounts.length === 0);
                      setSection(0);
                    }}
                  />
                  <UI.SortControlLabel label="Import Ledger Accounts" />
                </Styles.FlexRow>
                <Styles.FlexRow>
                  <ButtonText
                    iconLeft={faCaretRight}
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
                      <ChevronDownIcon
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
                              <ChevronDownIcon />
                            </Select.Icon>
                          </UI.SelectTrigger>
                          <Select.Portal>
                            <UI.SelectContent
                              $theme={theme}
                              position="popper"
                              sideOffset={3}
                            >
                              <Select.ScrollUpButton className="SelectScrollButton">
                                <ChevronUpIcon />
                              </Select.ScrollUpButton>
                              <Select.Viewport className="SelectViewport">
                                <Select.Group>
                                  {getSelectNetworkData(darkMode)
                                    .filter(({ network }) =>
                                      ['Polkadot', 'Kusama'].includes(network)
                                    )
                                    .map(
                                      ({
                                        network,
                                        ledgerId,
                                        iconWidth,
                                        iconFill,
                                      }) => (
                                        <UI.SelectItem
                                          key={ledgerId}
                                          value={network}
                                        >
                                          <div className="innerRow">
                                            <div>
                                              <ChainIcon
                                                chainId={network as ChainID}
                                                width={iconWidth}
                                                fill={iconFill}
                                                style={{
                                                  marginLeft:
                                                    network === 'Polkadot'
                                                      ? '2px'
                                                      : '0',
                                                }}
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
                                <ChevronDownIcon />
                              </Select.ScrollDownButton>
                            </UI.SelectContent>
                          </Select.Portal>
                        </Select.Root>

                        {/** Connect Button */}
                        <ConnectButton
                          onClick={() => {
                            ledger.setPageIndex(0);
                            handleGetLedgerAddresses(false);
                          }}
                          disabled={ledger.disableConnect()}
                        >
                          Connect
                        </ConnectButton>
                      </Styles.FlexRow>

                      {/** Error and Status Messages */}
                      {showConnectStatus && !ledger.deviceConnected && (
                        <InfoCard kind={'warning'} icon={faExclamationTriangle}>
                          <span>
                            {
                              determineStatusFromCodes(
                                ledger.statusCodes,
                                false
                              ).title
                            }
                          </span>
                          <button
                            className="dismiss"
                            onClick={() => setShowConnectStatus(false)}
                          >
                            <FontAwesomeIcon icon={faX} />
                          </button>
                        </InfoCard>
                      )}

                      {showConnectStatus &&
                        ledger.selectedNetworkState === '' && (
                          <InfoCard
                            kind={'warning'}
                            icon={faExclamationTriangle}
                          >
                            <span>Select a network.</span>
                          </InfoCard>
                        )}

                      <InfoCardSteps style={{ marginTop: '0.75rem' }}>
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
                      </InfoCardSteps>
                    </UI.AccordionContent>
                  </Accordion.Item>

                  {/** Import Addresses */}
                  <Accordion.Item
                    className="AccordionItem"
                    value={'import-accounts'}
                  >
                    <UI.AccordionTrigger narrow={true}>
                      <ChevronDownIcon
                        className="AccordionChevron"
                        aria-hidden
                      />
                      <UI.TriggerHeader>Import Accounts</UI.TriggerHeader>
                    </UI.AccordionTrigger>
                    <UI.AccordionContent transparent={true}>
                      {!ledger.deviceConnected ? (
                        <InfoCard
                          icon={faCircleDot}
                          iconTransform={'shrink-3'}
                          style={{ marginTop: '0', marginBottom: '0.75rem' }}
                        >
                          <span>
                            Connect a Ledger device to view its addresses.
                          </span>
                        </InfoCard>
                      ) : (
                        <>
                          <ItemsColumn>
                            {receivedAddresses.map(({ address, pubKey }, i) => (
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
                                          await window.myAPI.copyToClipboard(
                                            address
                                          )
                                        }
                                      />
                                    </span>
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
                                        <CheckIcon />
                                      </Checkbox.Indicator>
                                    </Styles.CheckboxRoot>
                                  )}
                                </div>
                              </ImportAddressRow>
                            ))}
                          </ItemsColumn>

                          <AddressListFooter>
                            <button
                              className="pageBtn"
                              disabled={
                                ledger.pageIndex === 0 || ledger.isFetching
                              }
                              onClick={() => handlePaginationClick('prev')}
                            >
                              <CaretLeftIcon />
                            </button>
                            <button
                              className="pageBtn"
                              disabled={ledger.isFetching}
                              onClick={() => handlePaginationClick('next')}
                            >
                              <CaretRightIcon />
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
    </UI.ScrollableMax>
  );
};
