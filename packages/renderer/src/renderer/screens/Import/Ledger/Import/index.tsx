// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import * as themeVariables from '../../../../theme/variables';

import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@radix-ui/react-icons';
import { Scrollable } from '@polkadot-live/ui/styles';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { ContentWrapper } from '../../../Wrappers';
import { ellipsisFn, setStateWithRef } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretLeft,
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
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  GetAddressMessage,
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

export const Import = ({ setSection }: AnyData) => {
  const { darkMode } = useConnections();
  const { ledgerAddresses: addresses, isAlreadyImported } = useAddresses();
  const { insertAccountStatus } = useAccountStatuses();
  const { handleImportAddress } = useImportHandler();

  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(Array.from({ length: 2 }, (_, index) => index));

  // Dynamic state.
  const [ledgerConnected, setLedgerConnected] = useState(false);
  const [showConnectStatus, setShowConnectStatus] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');

  // State for received addresses from `main` and selected addresses.
  const [receivedAddresses, setReceivedAddresses] = useState<
    RawLedgerAddress[]
  >([]);
  const [selectedAddresses, setSelectedAddresses] = useState<
    RawLedgerAddress[]
  >([]);

  const [isImporting, setIsImporting] = useState(false);
  const isImportingRef = useRef(isImporting);

  const [statusCodes, setStatusCodes] = useState<LedgerResponse[]>([]);
  const statusCodesRef = useRef(statusCodes);

  // Component constant data.
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const networkData = [
    { network: 'Polkadot', ledgerId: 'dot' },
    { network: 'Kusama', ledgerId: 'kusama' },
  ];

  /**
   * Called when `Connect` button is clicked.
   * Interact with Ledger device and perform necessary tasks.
   */
  const handleGetLedgerAddress = (chainName: string) => {
    if (selectedNetwork === '') {
      setShowConnectStatus(true);
      return;
    }
    const tasks: LedgerTask[] = ['get_address'];
    window.myAPI.doLedgerTask(getNextAddressIndex(), chainName, tasks);
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
    const { ack, device, statusCode, body, options } = parsed;
    handleNewStatusCode(ack, statusCode);

    // Update list of addresses fetched from Ledger device.
    if (statusCode === 'ReceivedAddress') {
      const { pubKey, address } = body[0];

      setReceivedAddresses((pv) => {
        const target = { address, pubKey, device, options };
        const filtered = pv.filter(({ pubKey: pk }) => pk !== pubKey);
        return [...filtered, target];
      });

      setLedgerConnected(true);
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

    setStateWithRef(true, setIsImporting, isImportingRef);
  }, []);

  /**
   * Util: Gets the next non-imported address index.
   */
  const getNextAddressIndex = () =>
    !addresses.length ? 0 : addresses[addresses.length - 1].index || 0 + 1;

  /**
   * Util: Handle an incoming new status code and persist to state.
   */
  const handleNewStatusCode = (ack: string, statusCode: string) => {
    const updated = [{ ack, statusCode }, ...statusCodesRef.current];
    updated.length > TOTAL_ALLOWED_STATUS_CODES && updated.pop();
    setStateWithRef(updated, setStatusCodes, statusCodesRef);
  };

  /**
   * Handle importing the selected Ledger addresses.
   */
  const handleImportProcess = async () => {
    if (selectedAddresses.length === 0) {
      return;
    }

    for (const { address, pubKey, device } of selectedAddresses) {
      if (isAlreadyImported(address)) {
        // TODO: Notify user address is already imported.
        continue;
      }

      const el = ellipsisFn(address);
      await handleImportAddress(address, 'ledger', el, pubKey, device);
      insertAccountStatus(address, 'ledger');
    }

    setStateWithRef(false, setIsImporting, isImportingRef);
    setStateWithRef([], setStatusCodes, statusCodesRef);
    setReceivedAddresses([]);
  };

  /**
   * Handle a checkbox click to add and remove selected addresses.
   */
  const handleCheckboxClick = (
    checkState: Checkbox.CheckedState,
    pk: string
  ) => {
    setSelectedAddresses((pv) => {
      const checked =
        typeof checkState === 'string' ? false : Boolean(checkState);

      const filtered = pv.filter(({ pubKey }) => pk !== pubKey);

      if (!checked) {
        return filtered;
      } else {
        const target = receivedAddresses.find(({ pubKey }) => pk === pubKey);
        return target ? [...filtered, target] : filtered;
      }
    });

    console.log(selectedAddresses);
  };

  return (
    <Scrollable
      $footerHeight={4}
      style={{ paddingTop: 0, paddingBottom: '2rem' }}
    >
      {/** Breadcrump */}
      <UI.ControlsWrapper $padWrapper={true} $padButton={false}>
        <ButtonPrimaryInvert
          className="back-btn"
          text="Back"
          iconLeft={faCaretLeft}
          onClick={() => setSection(0)}
        />
        <UI.SortControlLabel label="Import Ledger Addresses" />
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
                  onValueChange={(value) => setSelectedNetwork(value)}
                >
                  <SelectTrigger $theme={theme} aria-label="Network">
                    <Select.Value placeholder="Select Network" />
                    <Select.Icon>
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
                          {networkData.map(({ network, ledgerId }) => (
                            <SelectItem key={ledgerId} value={network}>
                              {network}
                            </SelectItem>
                          ))}
                        </Select.Group>
                      </Select.Viewport>
                      <Select.ScrollDownButton className="SelectScrollButton">
                        <ChevronDownIcon />
                      </Select.ScrollDownButton>
                    </SelectContent>
                  </Select.Portal>
                </Select.Root>

                <ConnectButton
                  onClick={() => handleGetLedgerAddress(selectedNetwork)}
                >
                  Connect
                </ConnectButton>
              </div>

              {/** Error and Status Messages */}
              {showConnectStatus && statusCodes.length > 0 && (
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
                  Select a network and click on the <b>Connect</b> button above.
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
                          <h2>Ledger Account {i + 1}</h2>
                          <span>{ellipsisFn(address, 12)}</span>
                        </div>
                        <CheckboxRoot
                          $theme={theme}
                          className="CheckboxRoot"
                          id="c1"
                          onCheckedChange={(checked) =>
                            handleCheckboxClick(checked, pubKey)
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
                    <button className="pageBtn">
                      <CaretLeftIcon />
                    </button>
                    <button className="pageBtn">
                      <CaretRightIcon />
                    </button>
                    <div className="importBtn">
                      <button onClick={async () => await handleImportProcess()}>
                        {`Import ${selectedAddresses.length ? selectedAddresses.length : ''} Addresses`}
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
