// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { defaultLedgerHardwareContext } from './defaults';
import { setStateWithRef } from '@w3ux/utils';
import { chainIcon } from '@ren/config/chains';
import { useConnections } from '../../common/Connections';
import type { LedgerHardwareContextInterface } from './types';
import type {
  GetAddressMessage,
  LedgerFetchedAddressData,
  LedgerResponse,
  LedgerTask,
} from '@polkadot-live/types/ledger';
import type { IpcRendererEvent } from 'electron';
import type { AnyData } from 'packages/types/src';

const TOTAL_ALLOWED_STATUS_CODES = 50;

export interface LedgerNetworkData {
  network: string;
  ledgerId: string;
  ChainIcon: AnyData;
  iconWidth: number;
  iconFill: string;
}

export interface RawLedgerAddress {
  address: string;
  pubKey: string;
  device: { id: string; productName: string };
  options: AnyData;
}

export type NamedRawLedgerAddress = RawLedgerAddress & {
  accountName: string;
};

export const LedgerHardwareContext =
  createContext<LedgerHardwareContextInterface>(defaultLedgerHardwareContext);

export const useLedgerHardware = () => useContext(LedgerHardwareContext);

export const LedgerHardwareProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { darkMode } = useConnections();

  const [deviceConnected, setDeviceConnected] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusCodes, setStatusCodes] = useState<LedgerResponse[]>([]);
  const statusCodesRef = useRef(statusCodes);

  const [selectedNetworkState, setSelectedNetworkState] = useState('');
  const [connectedNetwork, setConnectedNetwork] = useState('');
  const selectedNetworkRef = useRef(selectedNetworkState);
  const connectedNetworkRef = useRef(connectedNetwork);

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
   * Ledger supported network data.
   */
  const networkData: LedgerNetworkData[] = [
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
   * Reset selected addresses and page index when connecting to another network.
   */
  const preConnect = () => {
    setDeviceConnected(false);
    clearCaches(true, true, false);
  };

  /**
   * Interact with Ledger device and perform necessary tasks.
   */
  const fetchLedgerAddresses = (network: string, offset: number) => {
    if (selectedNetworkRef.current !== connectedNetworkRef.current) {
      preConnect();
    }

    const tasks: LedgerTask[] = ['get_address'];
    const accountIndices = Array.from({ length: 5 }, (_, i) => i).map(
      (i) => i + offset
    );

    setIsFetching(true);

    const serialized = JSON.stringify({
      accountIndices,
      chainName: network,
      tasks,
    });

    window.myAPI.doLedgerTask(serialized);

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
    clearStatusCodes: boolean
  ) => {
    clearReceived && setSelectedAddresses([]);
    clearSelected && setReceivedAddresses([]);

    if (clearStatusCodes) {
      setStateWithRef([], setStatusCodes, statusCodesRef);
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
  const disableConnect = () =>
    isFetching || selectedNetworkRef.current === connectedNetworkRef.current;

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
   * Handle an incoming new status code and persist to state.
   */
  const handleNewStatusCode = (ack: string, statusCode: string) => {
    const updated = [{ ack, statusCode }, ...statusCodesRef.current];
    updated.length > TOTAL_ALLOWED_STATUS_CODES && updated.pop();
    setStateWithRef(updated, setStatusCodes, statusCodesRef);
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
    accountName: string
  ) => {
    setSelectedAddresses((pv) => {
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

  return (
    <LedgerHardwareContext.Provider
      value={{
        connectedNetwork,
        deviceConnected,
        isFetching,
        isImporting,
        networkData,
        receivedAddresses,
        selectedAddresses,
        selectedNetworkState,
        statusCodes,
        clearCaches,
        disableConnect,
        fetchLedgerAddresses,
        getChecked,
        getImportLabel,
        resetAll,
        setIsImporting,
        setSelectedNetwork,
        updateSelectedAddresses,
      }}
    >
      {children}
    </LedgerHardwareContext.Provider>
  );
};
