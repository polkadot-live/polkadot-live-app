// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import * as themeVariables from '../../../../theme/variables';

import { useEffect, useState } from 'react';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useAddresses } from '@app/contexts/import/Addresses';
import { useConnections } from '@app/contexts/common/Connections';
import { useImportHandler } from '@app/contexts/import/ImportHandler';
import { useLedgerHardware } from '@ren/renderer/contexts/import/LedgerHardware';

import { BarLoader } from 'react-spinners';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@radix-ui/react-icons';
import { FlexColumn, FlexRow, Scrollable } from '@polkadot-live/ui/styles';
import { InfoCard } from '@polkadot-live/ui/components';
import {
  ButtonPrimaryInvert,
  ButtonText,
} from '@polkadot-live/ui/kits/buttons';
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
import {
  AddressListFooter,
  CheckboxRoot,
  ImportAddressRow,
} from '../../Wrappers';
import { InfoCardSteps } from '../../InfoCardSteps';
import { determineStatusFromCodes } from './Utils';
import { ItemsColumn } from '@app/screens/Home/Manage/Wrappers';
import { getSelectNetworkData } from '@ren/config/chains';
import type { ImportProps } from './types';

export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
  const { darkMode } = useConnections();
  const { isAlreadyImported, ledgerAddresses } = useAddresses();
  const { insertAccountStatus } = useAccountStatuses();
  const { handleImportAddress } = useImportHandler();

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
      style={{ paddingTop: 0, paddingBottom: '1rem' }}
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

      <div style={{ padding: '0.5rem 1.5rem 0rem' }}>
        <UI.ActionItem showIcon={false} text={'Ledger Accounts'} />
      </div>
      {/** Breadcrump */}
      <UI.ControlsWrapper
        $padWrapper={true}
        $padButton={false}
        style={{ paddingTop: '1rem' }}
      >
        <ButtonPrimaryInvert
          className="back-btn"
          text="Back"
          iconLeft={faCaretLeft}
          onClick={() => {
            ledger.clearCaches(false, false, true);
            setShowImportUi(ledgerAddresses.length === 0);
            setSection(0);
          }}
        />
        <UI.SortControlLabel label="Import Ledger Accounts" />

        <ButtonText
          iconLeft={faCaretRight}
          text={'Ledger Accounts'}
          disabled={ledgerAddresses.length === 0}
          onClick={() => {
            ledger.clearCaches(false, false, true);
            setShowImportUi(false);
          }}
        />
      </UI.ControlsWrapper>

      <div style={{ padding: '1.5rem 1.25rem 2rem', marginTop: '1rem' }}>
        <UI.AccordionWrapper $onePart={true}>
          <Accordion.Root
            className="AccordionRoot"
            type="multiple"
            value={accordionValue}
            onValueChange={(val) => setAccordionValue(val as string[])}
          >
            <FlexColumn>
              {/** Choose Network */}
              <Accordion.Item
                className="AccordionItem"
                value={'connect-ledger'}
              >
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>Connect Ledger</UI.TriggerHeader>
                </UI.AccordionTrigger>
                <UI.AccordionContent transparent={true}>
                  <FlexRow>
                    <Select.Root
                      value={ledger.selectedNetworkState}
                      onValueChange={(val) => ledger.setSelectedNetwork(val)}
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
                                    ChainIcon,
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
                  </FlexRow>

                  {/** Error and Status Messages */}
                  {showConnectStatus && !ledger.deviceConnected && (
                    <InfoCard kind={'warning'} icon={faExclamationTriangle}>
                      <span>
                        {
                          determineStatusFromCodes(ledger.statusCodes, false)
                            .title
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

                  {showConnectStatus && ledger.selectedNetworkState === '' && (
                    <InfoCard kind={'warning'} icon={faExclamationTriangle}>
                      <span>Select a network.</span>
                    </InfoCard>
                  )}

                  <InfoCardSteps style={{ marginTop: '0.75rem' }}>
                    <span>
                      Connect a Ledger device to this computer with a USB cable.
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
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
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
                            <UI.Identicon value={address} fontSize={'2.5rem'} />
                            <div className="addressInfo">
                              <h2>
                                {connectedNetwork} Ledger Account{' '}
                                {ledger.pageIndex * 5 + i + 1}
                              </h2>
                              <FlexRow $gap={'0.6rem'}>
                                <span>{ellipsisFn(address, 12)}</span>
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
                              </FlexRow>
                            </div>
                            {isAlreadyImported(address) ? (
                              <span className="imported">Imported</span>
                            ) : (
                              <CheckboxRoot
                                $theme={theme}
                                className="CheckboxRoot"
                                id={`c${i}`}
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
                          </ImportAddressRow>
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
                              selectedAddresses.length === 0 ||
                              ledger.isFetching ||
                              ledger.isImporting
                            }
                            onClick={async () => await handleImportProcess()}
                          >
                            {ledger.getImportLabel()}
                          </button>
                        </div>
                      </AddressListFooter>
                    </>
                  )}
                </UI.AccordionContent>
              </Accordion.Item>
            </FlexColumn>
          </Accordion.Root>
        </UI.AccordionWrapper>
      </div>
    </Scrollable>
  );
};
