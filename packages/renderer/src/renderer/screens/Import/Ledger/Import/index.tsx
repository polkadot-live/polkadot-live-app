// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import * as themeVariables from '../../../../theme/variables';

import { forwardRef, useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@radix-ui/react-icons';
import { Scrollable } from '@polkadot-live/ui/styles';
import {
  ButtonPrimaryInvert,
  ButtonText,
} from '@polkadot-live/ui/kits/buttons';
import { ContentWrapper } from '../../../Wrappers';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretLeft,
  faCaretRight,
  faCheckCircle,
  faCircleInfo,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import {
  CheckboxRoot,
  ConnectButton,
  InfoCard,
  LedgerAddressRow,
  SelectTrigger,
  SelectContent,
  AddressListFooter,
} from './Wrappers';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useConnections } from '@app/contexts/common/Connections';
import { useImportHandler } from '@app/contexts/import/ImportHandler';
import { useLedgerHardware } from '@ren/renderer/contexts/import/LedgerHardware';
import { determineStatusFromCodes } from '../Utils';
import { ItemsColumn } from '@app/screens/Home/Manage/Wrappers';
import { useAddresses } from '@app/contexts/import/Addresses';
import type { AnyData } from '@polkadot-live/types/misc';

export const Import = ({ setSection, setShowImportUi }: AnyData) => {
  const { darkMode } = useConnections();
  const { isAlreadyImported, ledgerAddresses } = useAddresses();
  const { insertAccountStatus } = useAccountStatuses();
  const { handleImportAddress } = useImportHandler();

  const ledger = useLedgerHardware();
  const { connectedNetwork, selectedAddresses, receivedAddresses } =
    useLedgerHardware();

  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(Array.from({ length: 2 }, (_, index) => index));

  const [showConnectStatus, setShowConnectStatus] = useState(false);
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

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

    for (const selected of selectedAddresses) {
      const { address: add, pubKey: pk, device, accountName } = selected;

      if (isAlreadyImported(add)) {
        continue;
      }

      await handleImportAddress(add, 'ledger', accountName, false, pk, device);
      insertAccountStatus(add, 'ledger');
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
    <Scrollable
      $footerHeight={4}
      style={{ paddingTop: 0, paddingBottom: '2rem' }}
    >
      {(ledger.isFetching || ledger.isImporting) && (
        <BarLoader
          color={darkMode ? '#642763' : '#a772a6'}
          width={'100%'}
          height={2}
          cssOverride={{ position: 'fixed', top: 0, zIndex: 99 }}
          speedMultiplier={0.75}
        />
      )}

      {/** Breadcrump */}
      <UI.ControlsWrapper $padWrapper={true} $padButton={false}>
        <ButtonPrimaryInvert
          className="back-btn"
          text="Back"
          iconLeft={faCaretLeft}
          onClick={() => {
            setShowImportUi(ledgerAddresses.length === 0);
            setSection(0);
          }}
        />
        <UI.SortControlLabel label="Import Ledger Addresses" />
        <ButtonText
          iconLeft={faCaretRight}
          text={'Manage Ledger Accounts'}
          disabled={ledgerAddresses.length === 0}
          onClick={() => setShowImportUi(false)}
        />
      </UI.ControlsWrapper>

      <ContentWrapper style={{ padding: '1rem 2rem 0', marginTop: '1rem' }}>
        <UI.Accordion
          multiple
          defaultIndex={accordionActiveIndices}
          setExternalIndices={setAccordionActiveIndices}
          gap={'1rem'}
          panelPadding={'0.75rem 0.25rem'}
        >
          {/** Choose Network */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Connect Ledger"
              itemIndex={0}
              wide={true}
            />
            <UI.AccordionPanel>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Select.Root
                  value={ledger.selectedNetworkState}
                  onValueChange={(val) => ledger.setSelectedNetwork(val)}
                >
                  <SelectTrigger $theme={theme} aria-label="Network">
                    <Select.Value placeholder="Select Network" />
                    <Select.Icon className="SelectIcon">
                      <ChevronDownIcon />
                    </Select.Icon>
                  </SelectTrigger>
                  <Select.Portal>
                    <SelectContent
                      $theme={theme}
                      position="popper"
                      sideOffset={3}
                    >
                      <Select.ScrollUpButton className="SelectScrollButton">
                        <ChevronUpIcon />
                      </Select.ScrollUpButton>
                      <Select.Viewport className="SelectViewport">
                        <Select.Group>
                          {ledger.networkData.map(
                            ({
                              network,
                              ledgerId,
                              ChainIcon,
                              iconWidth,
                              iconFill,
                            }) => (
                              <SelectItem key={ledgerId} value={network}>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '0.75rem',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div style={{ minWidth: '30px' }}>
                                    <ChainIcon
                                      width={iconWidth}
                                      fill={iconFill}
                                      style={{
                                        marginLeft:
                                          network === 'Polkadot' ? '2px' : '0',
                                      }}
                                    />
                                  </div>

                                  <div>{network}</div>
                                </div>
                              </SelectItem>
                            )
                          )}
                        </Select.Group>
                      </Select.Viewport>
                      <Select.ScrollDownButton className="SelectScrollButton">
                        <ChevronDownIcon />
                      </Select.ScrollDownButton>
                    </SelectContent>
                  </Select.Portal>
                </Select.Root>

                <ConnectButton
                  onClick={() => {
                    ledger.setPageIndex(0);
                    handleGetLedgerAddresses(false);
                  }}
                  disabled={ledger.disableConnect()}
                >
                  Connect
                </ConnectButton>
              </div>

              {/** Error and Status Messages */}
              {showConnectStatus &&
                !ledger.deviceConnected &&
                ledger.statusCodes.length > 0 && (
                  <InfoCard>
                    <span className="warning">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      {
                        determineStatusFromCodes(ledger.statusCodes, false)
                          .title
                      }
                    </span>
                  </InfoCard>
                )}

              {showConnectStatus && ledger.selectedNetworkState === '' && (
                <InfoCard>
                  <span className="warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Select a network.
                  </span>
                </InfoCard>
              )}

              <InfoCard>
                <span>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Connect a Ledger device to this computer with a USB cable.
                </span>
                <span>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Unlock the Ledger device and open the Polkadot app.
                </span>
                <span>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Select a network above and click on the <b>Connect</b> button.
                </span>
              </InfoCard>
            </UI.AccordionPanel>
          </UI.AccordionItem>

          {/** Import Addresses */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Import Addresses"
              itemIndex={1}
              wide={true}
            />
            <UI.AccordionPanel>
              {!ledger.deviceConnected ? (
                <InfoCard style={{ marginTop: '0', marginBottom: '0.75rem' }}>
                  <span>
                    <FontAwesomeIcon icon={faCircleInfo} />
                    Connect a Ledger device to list its derived addresses.
                  </span>
                </InfoCard>
              ) : (
                <>
                  <ItemsColumn>
                    {receivedAddresses.map(({ address, pubKey }, i) => (
                      <LedgerAddressRow key={address}>
                        <UI.Identicon value={address} size={28} />
                        <div className="addressInfo">
                          <h2>
                            {connectedNetwork} Ledger Account{' '}
                            {ledger.pageIndex * 5 + i + 1}
                          </h2>
                          <span>{ellipsisFn(address, 12)}</span>
                        </div>
                        {isAlreadyImported(address) ? (
                          <span className="imported">Imported</span>
                        ) : (
                          <CheckboxRoot
                            $theme={theme}
                            className="CheckboxRoot"
                            id="c1"
                            checked={ledger.getChecked(pubKey)}
                            disabled={ledger.isFetching}
                            onCheckedChange={(checked) =>
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
                          </CheckboxRoot>
                        )}
                      </LedgerAddressRow>
                    ))}
                  </ItemsColumn>

                  <AddressListFooter>
                    <button
                      className="pageBtn"
                      disabled={ledger.pageIndex === 0 || ledger.isFetching}
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
                          selectedAddresses.length === 0 || ledger.isFetching
                        }
                        onClick={async () => await handleImportProcess()}
                      >
                        {ledger.getImportLabel()}
                      </button>
                    </div>
                  </AddressListFooter>
                </>
              )}
            </UI.AccordionPanel>
          </UI.AccordionItem>
        </UI.Accordion>
      </ContentWrapper>
    </Scrollable>
  );
};

const SelectItem = forwardRef(function SelectItem(
  { children, className, ...props }: AnyData,
  forwardedRef
) {
  return (
    <Select.Item
      className={`SelectItem ${className}`}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="SelectItemIndicator">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
});
