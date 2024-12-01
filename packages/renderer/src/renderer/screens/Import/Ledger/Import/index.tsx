// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import * as themeVariables from '../../../../theme/variables';

import { forwardRef, useEffect, useRef, useState } from 'react';
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
import { ellipsisFn, setStateWithRef } from '@w3ux/utils';
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
import { determineStatusFromCodes } from '../Utils';
import { ItemsColumn } from '@app/screens/Home/Manage/Wrappers';
import { useAddresses } from '@app/contexts/import/Addresses';
import { chainIcon } from '@ren/config/chains';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  GetAddressMessage,
  LedgerFetchedAddressData,
  LedgerResponse,
  LedgerTask,
} from '@polkadot-live/types/ledger';
import type { IpcRendererEvent } from 'electron';

const TOTAL_ALLOWED_STATUS_CODES = 50;

interface RawLedgerAddress {
  address: string;
  pubKey: string;
  device: { id: string; productName: string };
  options: AnyData;
}

type NamedRawLedgerAddress = RawLedgerAddress & {
  accountName: string;
};

export const Import = ({ setSection, setShowImportUi }: AnyData) => {
  const { darkMode } = useConnections();
  const { isAlreadyImported, ledgerAddresses } = useAddresses();
  const { insertAccountStatus } = useAccountStatuses();
  const { handleImportAddress } = useImportHandler();

  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(Array.from({ length: 2 }, (_, index) => index));

  // Dynamic state.
  const [ledgerConnected, setLedgerConnected] = useState(false);
  const [showConnectStatus, setShowConnectStatus] = useState(false);

  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [connectedNetwork, setConnectedNetwork] = useState('');
  const selectedNetworkRef = useRef(selectedNetwork);
  const connectedNetworkRef = useRef(connectedNetwork);

  // The current page of the listed Ledger addresses.
  const [pageIndex, setPageIndex] = useState(0);

  // State for received addresses from `main` and selected addresses.
  const [receivedAddresses, setReceivedAddresses] = useState<
    RawLedgerAddress[]
  >([]);
  const [selectedAddresses, setSelectedAddresses] = useState<
    NamedRawLedgerAddress[]
  >([]);

  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusCodes, setStatusCodes] = useState<LedgerResponse[]>([]);
  const statusCodesRef = useRef(statusCodes);

  // Component constant data.
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const networkData = [
    {
      network: 'Polkadot',
      ledgerId: 'dot',
      ChainIcon: chainIcon('Polkadot'),
      iconWidth: 18,
      iconFill: '#ac2461',
    },
    {
      network: 'Kusama',
      ledgerId: 'kusama',
      ChainIcon: chainIcon('Kusama'),
      iconWidth: 24,
      iconFill: darkMode ? '#e7e7e7' : '#2f2f2f',
    },
  ];

  /**
   * Util: Handle an incoming new status code and persist to state.
   */
  const handleNewStatusCode = (ack: string, statusCode: string) => {
    const updated = [{ ack, statusCode }, ...statusCodesRef.current];
    updated.length > TOTAL_ALLOWED_STATUS_CODES && updated.pop();
    setStateWithRef(updated, setStatusCodes, statusCodesRef);
  };

  /**
   * Reset selected addresses and page index when connecting to another network.
   */
  const preConnect = () => {
    setLedgerConnected(false);
    setSelectedAddresses([]);
    setReceivedAddresses([]);
    setPageIndex(0);
  };

  /**
   * Update the connected network state post connection.
   */
  const postConnect = () => {
    const val = selectedNetworkRef.current;
    setConnectedNetwork(val);
    connectedNetworkRef.current = val;
  };

  /**
   * Called when `Connect` button is clicked.
   * Interact with Ledger device and perform necessary tasks.
   */
  const handleGetLedgerAddress = (changingPage: boolean, targetIndex = 0) => {
    if (selectedNetwork === '') {
      setShowConnectStatus(true);
      return;
    }

    const tasks: LedgerTask[] = ['get_address'];
    const offset = !changingPage ? 0 : targetIndex! * 5;
    const accountIndices = Array.from({ length: 5 }, (_, i) => i).map(
      (i) => i + offset
    );

    setIsFetching(true);

    // Use the connected network if we're changing page.
    // Otherwise, use the selected network.
    const network = changingPage
      ? connectedNetwork === ''
        ? selectedNetwork
        : connectedNetwork
      : selectedNetwork;

    const serialized = JSON.stringify({
      accountIndices,
      chainName: network,
      tasks,
    });

    window.myAPI.doLedgerTask(serialized);
  };

  /**
   * Update flag to show error/status messages.
   */
  useEffect(() => {
    if (statusCodes.length > 0) {
      setShowConnectStatus(true);
    }
  }, [statusCodes]);

  /**
   * Handle a collection of received Ledger addresses.
   */
  const handleLedgerStatusResponse = (parsed: GetAddressMessage) => {
    const { ack, statusCode, options } = parsed;

    switch (statusCode) {
      /** Handle fetched Ledger addresses. */
      case 'ReceiveAddress': {
        const { addresses } = parsed;
        const received: LedgerFetchedAddressData[] = JSON.parse(addresses!);

        // Cache new address list.
        const newCache: RawLedgerAddress[] = [];

        for (const { body, device } of received) {
          handleNewStatusCode(ack, statusCode);

          if (statusCode === 'ReceiveAddress') {
            const { pubKey, address } = body[0];
            newCache.push({ address, pubKey, device, options });
          }
        }

        setReceivedAddresses(newCache);
        setIsFetching(false);
        setLedgerConnected(true);
        break;
      }
      /** Handle error messages. */
      default: {
        setIsFetching(false);
        setConnectedNetwork('');
        connectedNetworkRef.current = '';
        handleNewStatusCode(ack, statusCode);
        break;
      }
    }
  };

  /**
   * Set up main process listener for Ledger IO when component loads.
   */
  useEffect(() => {
    window.myAPI.reportLedgerStatus((_: IpcRendererEvent, result: string) => {
      const parsed: GetAddressMessage | undefined = JSON.parse(result);

      if (!parsed) {
        throw new Error('Unable to parse GetAddressMessage');
      }

      handleLedgerStatusResponse(parsed);
    });
  }, []);

  /**
   * Handle a checkbox click to add and remove selected addresses.
   * An initial account name is assigned.
   */
  const handleCheckboxClick = (
    checkState: Checkbox.CheckedState,
    pk: string,
    accountName: string
  ) => {
    setSelectedAddresses((pv) => {
      const checked =
        typeof checkState === 'string' ? false : Boolean(checkState);

      const filtered = pv.filter(({ pubKey }) => pk !== pubKey);

      if (!checked) {
        return filtered;
      }

      const target = receivedAddresses.find(({ pubKey }) => pk === pubKey);

      if (target) {
        const namedTarget: NamedRawLedgerAddress = { ...target, accountName };
        return [...filtered, namedTarget];
      } else {
        return filtered;
      }
    });
  };

  /**
   * Handle clicks for pagination buttons.
   */
  const handlePaginationClick = (direction: 'prev' | 'next') => {
    const targetIndex =
      direction === 'prev'
        ? Math.max(0, pageIndex - 1)
        : Math.max(0, pageIndex + 1);

    setPageIndex(targetIndex);
    handleGetLedgerAddress(true, targetIndex);
  };

  /**
   * Determine if the checkbox for a fetched address should be checked.
   * An address which was selected before should have a checked state.
   */
  const getChecked = (pk: string) =>
    selectedAddresses.find(({ pubKey }) => pubKey === pk) ? true : false;

  /**
   * Get import button text.
   */
  const getImportLabel = () => {
    const len = selectedAddresses.length;
    return `Import ${len ? len : ''} Address${len === 1 ? '' : 'es'}`;
  };

  /**
   * Handle importing the selected Ledger addresses.
   */
  const handleImportProcess = async () => {
    if (selectedAddresses.length === 0) {
      return;
    }

    for (const selected of selectedAddresses) {
      const { address: add, pubKey: pk, device, accountName } = selected;

      if (isAlreadyImported(add)) {
        continue;
      }

      await handleImportAddress(add, 'ledger', accountName, false, pk, device);
      insertAccountStatus(add, 'ledger');
    }

    setStateWithRef([], setStatusCodes, statusCodesRef);
    setSelectedAddresses([]);
  };

  const preImport = () => {
    setIsImporting(true);
  };

  const postImport = () => {
    setIsImporting(false);
    setShowImportUi(false);
  };

  return (
    <Scrollable
      $footerHeight={4}
      style={{ paddingTop: 0, paddingBottom: '2rem' }}
    >
      {(isFetching || isImporting) && (
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
                  value={selectedNetwork}
                  onValueChange={(val) => {
                    setSelectedNetwork(val);
                    selectedNetworkRef.current = val;
                  }}
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
                          {networkData.map(
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
                    preConnect();
                    handleGetLedgerAddress(false);
                    postConnect();
                  }}
                  disabled={
                    isFetching ||
                    selectedNetworkRef.current === connectedNetworkRef.current
                  }
                >
                  Connect
                </ConnectButton>
              </div>

              {/** Error and Status Messages */}
              {showConnectStatus &&
                !ledgerConnected &&
                statusCodes.length > 0 && (
                  <InfoCard>
                    <span className="warning">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      {determineStatusFromCodes(statusCodes, false).title}
                    </span>
                  </InfoCard>
                )}

              {showConnectStatus && selectedNetwork === '' && (
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
              {!ledgerConnected ? (
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
                            {pageIndex * 5 + i + 1}
                          </h2>
                          <span>{ellipsisFn(address, 12)}</span>
                        </div>
                        <CheckboxRoot
                          $theme={theme}
                          className="CheckboxRoot"
                          id="c1"
                          checked={getChecked(pubKey)}
                          disabled={isFetching}
                          onCheckedChange={(checked) =>
                            handleCheckboxClick(
                              checked,
                              pubKey,
                              `${connectedNetwork} Ledger Account ${pageIndex * 5 + i + 1}`
                            )
                          }
                        >
                          <Checkbox.Indicator className="CheckboxIndicator">
                            <CheckIcon />
                          </Checkbox.Indicator>
                        </CheckboxRoot>
                      </LedgerAddressRow>
                    ))}
                  </ItemsColumn>

                  <AddressListFooter>
                    <button
                      className="pageBtn"
                      disabled={pageIndex === 0 || isFetching}
                      onClick={() => handlePaginationClick('prev')}
                    >
                      <CaretLeftIcon />
                    </button>
                    <button
                      className="pageBtn"
                      disabled={isFetching}
                      onClick={() => handlePaginationClick('next')}
                    >
                      <CaretRightIcon />
                    </button>
                    <div className="importBtn">
                      <button
                        disabled={selectedAddresses.length === 0 || isFetching}
                        onClick={async () => {
                          preImport();
                          await handleImportProcess();
                          postImport();
                        }}
                      >
                        {getImportLabel()}
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
