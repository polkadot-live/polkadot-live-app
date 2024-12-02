// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useRef, useState } from 'react';
import { defaultLedgerHardwareContext } from './defaults';
import { setStateWithRef } from '@w3ux/utils';
import { chainIcon } from '@ren/config/chains';
import { useConnections } from '../../common/Connections';
import type { LedgerHardwareContextInterface } from './types';
import type { LedgerResponse, LedgerTask } from '@polkadot-live/types/ledger';
import type { AnyData } from 'packages/types/src';

const TOTAL_ALLOWED_STATUS_CODES = 50;

export interface LedgerNetworkData {
  network: string;
  ledgerId: string;
  ChainIcon: AnyData;
  iconWidth: number;
  iconFill: string;
}

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
   * Interact with Ledger device and perform necessary tasks.
   */
  const fetchLedgerAddresses = (network: string, offset: number) => {
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
  };

  /**
   * Util: Handle an incoming new status code and persist to state.
   */
  const handleNewStatusCode = (ack: string, statusCode: string) => {
    const updated = [{ ack, statusCode }, ...statusCodesRef.current];
    updated.length > TOTAL_ALLOWED_STATUS_CODES && updated.pop();
    setStateWithRef(updated, setStatusCodes, statusCodesRef);
  };

  return (
    <LedgerHardwareContext.Provider
      value={{
        isFetching,
        isImporting,
        statusCodes,
        statusCodesRef,
        setIsFetching,
        setIsImporting,
        setDeviceConnected,
        setStatusCodes,
        handleNewStatusCode,
        fetchLedgerAddresses,
        deviceConnected,
        networkData,
      }}
    >
      {children}
    </LedgerHardwareContext.Provider>
  );
};
