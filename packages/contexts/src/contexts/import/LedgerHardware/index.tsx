// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import { decodeAddress, u8aToHex } from 'dedot/utils';
import { createContext, useRef, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getLedgerHardwareAdapter } from './adapters';
import type { LedgerMetadata } from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  ILedgerController,
  LedgerResponse,
  LedgerTaskResponse,
  SerLedgerTaskResponse,
} from '@polkadot-live/types/ledger';
import type {
  LedgerHardwareContextInterface,
  NamedRawLedgerAddress,
  RawLedgerAddress,
} from '../../../types/import';

export const LedgerHardwareContext = createContext<
  LedgerHardwareContextInterface | undefined
>(undefined);

export const useLedgerHardware = createSafeContextHook(
  LedgerHardwareContext,
  'LedgerHardwareContext',
);

export const LedgerHardwareProvider = ({
  children,
  ledgerController,
}: {
  children: React.ReactNode;
  ledgerController?: ILedgerController;
}) => {
  const adapter = getLedgerHardwareAdapter();
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [lastStatusCode, setLastStatusCode] = useState<LedgerResponse | null>(
    null,
  );

  const [selectedNetworkState, setSelectedNetworkState] = useState('');
  const [connectedNetwork, setConnectedNetwork] = useState('');
  const selectedNetworkRef = useRef(selectedNetworkState);
  const connectedNetworkRef = useRef(connectedNetwork);

  /**
   * Access to ledger controller (extension).
   */
  const ledgerControllerRef = useRef<ILedgerController | undefined>(
    ledgerController,
  );

  /**
   * State for received addresses from `main` and selected addresses.
   */
  const [receivedAddresses, setReceivedAddresses] = useState<
    RawLedgerAddress[]
  >([]);

  const [selectedAddresses, setSelectedAddresses] = useState<
    NamedRawLedgerAddress[]
  >([]);

  /**
   * Reset selected addresses and page index when connecting to another network.
   */
  const preConnect = () => {
    setDeviceConnected(false);
    clearCaches(true, true, false);
  };

  /**
   * Derive public key from encoded address.
   */
  const getPublicKey = (address: string) => {
    const prefix = connectedNetwork.startsWith('Polkadot') ? 0 : 2;
    return u8aToHex(decodeAddress(address, true, prefix));
  };

  /**
   * Interact with Ledger device and perform necessary tasks.
   */
  const fetchLedgerAddresses = async (network: ChainID, offset: number) => {
    if (selectedNetworkRef.current !== connectedNetworkRef.current) {
      preConnect();
    }
    const accountIndices = Array.from({ length: 5 }, (_, i) => i).map(
      (i) => i + offset,
    );
    setIsFetching(true);
    const controller = ledgerControllerRef.current;
    const response = await adapter.getLedgerAddresses(
      accountIndices,
      network,
      controller,
    );
    handleLedgerStatusResponse(response);

    // Update the connected network state post connection.
    const val = selectedNetworkRef.current;
    setConnectedNetwork(val);
    connectedNetworkRef.current = val;
  };

  /**
   * Clear address caches.
   */
  const clearCaches = (
    clearReceived: boolean,
    clearSelected: boolean,
    clearStatusCodes: boolean,
  ) => {
    clearReceived && setSelectedAddresses([]);
    clearSelected && setReceivedAddresses([]);

    if (clearStatusCodes) {
      setLastStatusCode(null);
    }
  };

  /**
   * Reset state and disconnect ledger. Called after a successful import.
   */
  const resetAll = () => {
    clearCaches(true, true, true);
    setIsImporting(false);
    setDeviceConnected(false);
    setStateWithRef('', setConnectedNetwork, connectedNetworkRef);
    setStateWithRef('', setSelectedNetwork, selectedNetworkRef);
  };

  /**
   * Controls the disabled state of connect button.
   */
  const disableConnect = () => isFetching || selectedNetworkState === '';

  /**
   * Determine if the checkbox for a fetched address should be checked.
   * An address which was selected before should have a checked state.
   */
  const getChecked = (pk: string) => {
    const found = selectedAddresses.find(
      ({ address }) => getPublicKey(address) === pk,
    );
    return !!found;
  };

  /**
   * Get import button text.
   */
  const getImportLabel = () => {
    const len = selectedAddresses.length;
    return len === 0
      ? 'Import'
      : `Import ${len ? len : ''} Address${len === 1 ? '' : 'es'}`;
  };

  /**
   * Handle an incoming new status code and persist to state.
   */
  const handleNewStatusCode = (ack: string, statusCode: string) => {
    setLastStatusCode({ ack, statusCode });
  };

  /**
   * Set the selected network state and its reference.
   */
  const setSelectedNetwork = (network: string) => {
    setSelectedNetworkState(network);
    selectedNetworkRef.current = network;
  };

  /**
   * Handle a checkbox click to add and remove selected addresses.
   * An initial account name is assigned.
   */
  const updateSelectedAddresses = (
    checked: boolean,
    pk: string,
    accountName: string,
  ) => {
    setSelectedAddresses((pv) => {
      const filtered = pv.filter(({ address }) => pk !== getPublicKey(address));

      if (!checked) {
        return filtered;
      }
      const target = receivedAddresses.find(
        ({ address }) => pk === getPublicKey(address),
      );
      if (target) {
        const namedTarget: NamedRawLedgerAddress = { ...target, accountName };
        return [...filtered, namedTarget];
      } else {
        return filtered;
      }
    });
  };

  /**
   * Handle a collection of received Ledger addresses.
   */
  const handleLedgerStatusResponse = (
    response: LedgerTaskResponse | SerLedgerTaskResponse,
  ) => {
    const { ack, statusCode } = response;

    switch (statusCode) {
      /** Handle fetched Ledger addresses. */
      case 'ReceiveAddress': {
        const { options, received } =
          adapter.handleFetchedAddressData(response);

        // Cache new address list.
        const cache: RawLedgerAddress[] = [];
        let i = 0;
        for (const { body, device } of received) {
          handleNewStatusCode(ack, statusCode);
          const { pubKey, address } = body;
          const ledgerMeta: LedgerMetadata = {
            device,
            accountIndex: options.accountIndices[i],
          };
          cache.push({ address, ledgerMeta, pubKey, options });
          i += 1;
        }

        setReceivedAddresses(cache);
        setIsFetching(false);
        setDeviceConnected(true);
        break;
      }
      /** Handle error messages. */
      default: {
        setConnectedNetwork('');
        connectedNetworkRef.current = '';
        setIsFetching(false);
        handleNewStatusCode(ack, statusCode);
        break;
      }
    }
  };

  return (
    <LedgerHardwareContext
      value={{
        connectedNetwork,
        deviceConnected,
        isFetching,
        isImporting,
        pageIndex,
        receivedAddresses,
        selectedAddresses,
        selectedNetworkState,
        lastStatusCode,
        clearCaches,
        disableConnect,
        fetchLedgerAddresses,
        getChecked,
        getPublicKey,
        getImportLabel,
        resetAll,
        setIsImporting,
        setPageIndex,
        setSelectedNetwork,
        updateSelectedAddresses,
      }}
    >
      {children}
    </LedgerHardwareContext>
  );
};
