// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ConnectionsContextInterface } from './types';
import type { IpcRendererEvent } from 'electron';
import type { SyncID } from '@polkadot-live/types/communication';
import type { WcSyncFlags } from '@polkadot-live/types/walletConnect';

/**
 * Automatically listens for and sets shared state when the state is
 * updated in other processes.
 *
 * Keeps state synchronized between processes.
 */

export const ConnectionsContext = createContext<ConnectionsContextInterface>(
  defaults.defaultConnectionsContext
);

export const useConnections = () => useContext(ConnectionsContext);

export const ConnectionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Flag set to `true` when app is in online mode.
  const [isConnected, setIsConnected] = useState(false);

  // Flag shared between renderers (not main process).
  const [isOnlineMode, setIsOnlineMode] = useState(false);

  // Flag set to `true` when app is importing data from backup file.
  const [isImporting, setIsImporting] = useState(false);

  // Flag set to `true` when app's theme is dark mode.
  const [darkMode, setDarkMode] = useState(true);

  // Flag set to `true` when an extrinsic is getting built.
  const [isBuildingExtrinsic, setIsBuildingExtrinsic] = useState(false);

  // WalletConnect flags.
  const [wcSyncFlags, setWcSyncFlags] = useState<WcSyncFlags>({
    wcConnecting: false,
    wcDisconnecting: false,
    wcInitialized: false,
    wcSessionRestored: false,
    wcAccountApproved: false,
    wcVerifyingAccount: false,
  });

  useEffect(() => {
    // Synchronize flags in store.
    const syncSharedStateOnMount = async () => {
      const getAsBoolean = async (syncId: SyncID) =>
        (await window.myAPI.getSharedState(syncId)) as boolean;

      setIsConnected(await getAsBoolean('isConnected'));
      setIsOnlineMode(await getAsBoolean('isOnlineMode'));
      setIsImporting(await getAsBoolean('isImporting'));
      setDarkMode((await window.myAPI.getAppSettings()).appDarkMode);
      setIsBuildingExtrinsic(await getAsBoolean('isBuildingExtrinsic'));

      // Get WalletConnect flags asynchronously.
      const results = await Promise.all([
        getAsBoolean('wc:connecting'),
        getAsBoolean('wc:disconnecting'),
        getAsBoolean('wc:initialized'),
        getAsBoolean('wc:session:restored'),
        getAsBoolean('wc:account:approved'),
        getAsBoolean('wc:account:verifying'),
      ]);

      setWcSyncFlags({
        wcConnecting: results[0],
        wcDisconnecting: results[1],
        wcInitialized: results[2],
        wcSessionRestored: results[3],
        wcAccountApproved: results[4],
        wcVerifyingAccount: results[5],
      });
    };

    // Listen for shared state syncing.
    window.myAPI.syncSharedState(
      (
        _: IpcRendererEvent,
        { syncId, state }: { syncId: SyncID; state: string | boolean }
      ) => {
        switch (syncId) {
          case 'darkMode': {
            setDarkMode(state as boolean);
            break;
          }
          case 'isConnected': {
            setIsConnected(state as boolean);
            break;
          }
          case 'isImporting': {
            setIsImporting(state as boolean);
            break;
          }
          case 'isOnlineMode': {
            setIsOnlineMode(state as boolean);
            break;
          }
          case 'isBuildingExtrinsic': {
            setIsBuildingExtrinsic(state as boolean);
            break;
          }
          case 'wc:account:approved': {
            const wcAccountApproved = state as boolean;
            setWcSyncFlags((pv) => ({ ...pv, wcAccountApproved }));
            break;
          }
          case 'wc:connecting': {
            const wcConnecting = state as boolean;
            setWcSyncFlags((pv) => ({ ...pv, wcConnecting }));
            break;
          }
          case 'wc:disconnecting': {
            const wcDisconnecting = state as boolean;
            setWcSyncFlags((pv) => ({ ...pv, wcDisconnecting }));
            break;
          }
          case 'wc:initialized': {
            const wcInitialized = state as boolean;
            setWcSyncFlags((pv) => ({ ...pv, wcInitialized }));
            break;
          }
          case 'wc:session:restored': {
            const wcSessionRestored = state as boolean;
            setWcSyncFlags((pv) => ({ ...pv, wcSessionRestored }));
            break;
          }
          case 'wc:account:verifying': {
            const wcVerifyingAccount = state as boolean;
            setWcSyncFlags((pv) => ({ ...pv, wcVerifyingAccount }));
            break;
          }
          default: {
            break;
          }
        }
      }
    );

    syncSharedStateOnMount();
  }, []);

  /**
   * Return flag indicating whether app is in online or offline mode.
   */
  const getOnlineMode = () => isConnected && isOnlineMode;

  return (
    <ConnectionsContext.Provider
      value={{
        darkMode,
        isConnected,
        isImporting,
        isOnlineMode,
        isBuildingExtrinsic,
        wcSyncFlags,
        getOnlineMode,
        setDarkMode,
        setIsConnected,
        setIsImporting,
        setIsOnlineMode,
        setIsBuildingExtrinsic,
      }}
    >
      {children}
    </ConnectionsContext.Provider>
  );
};
