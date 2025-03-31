// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ConnectionsContextInterface } from './types';
import type { IpcRendererEvent } from 'electron';
import type {
  SharedStateID,
  SyncFlag,
} from '@polkadot-live/types/communication';
import type { WcSyncFlags } from '@polkadot-live/types/walletConnect';
import type { ChainID } from '@polkadot-live/types/chains';

/**
 * Automatically listens for and sets mode flag state when they are
 * updated in other processes.
 *
 * Immediately sets this renderer's mode flag state which is
 * consistent with the app.
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
  /**
   * Shared State
   */

  // Mapped boolean set to `true` when the chain's API instance is in use.
  const [activeAPIs, setActiveAPIs] = useState(
    new Map<ChainID, boolean>([
      ['Polkadot', false],
      ['Kusama', false],
      ['Westend', false],
    ])
  );

  /**
   * Flags
   */

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
    const syncModeFlagsOnMount = async () => {
      setIsConnected(await window.myAPI.getModeFlag('isConnected'));
      setIsOnlineMode(await window.myAPI.getModeFlag('isOnlineMode'));
      setIsImporting(await window.myAPI.getModeFlag('isImporting'));
      setDarkMode((await window.myAPI.getAppSettings()).appDarkMode);

      setIsBuildingExtrinsic(
        await window.myAPI.getModeFlag('isBuildingExtrinsic')
      );

      // Get WalletConnect flags asynchronously.
      const results = await Promise.all([
        window.myAPI.getModeFlag('wc:connecting'),
        window.myAPI.getModeFlag('wc:disconnecting'),
        window.myAPI.getModeFlag('wc:initialized'),
        window.myAPI.getModeFlag('wc:session:restored'),
        window.myAPI.getModeFlag('wc:account:approved'),
        window.myAPI.getModeFlag('wc:account:verifying'),
      ]);

      setWcSyncFlags({
        wcConnecting: results[0],
        wcDisconnecting: results[1],
        wcInitialized: results[2],
        wcSessionRestored: results[3],
        wcAccountApproved: results[4],
        wcVerifyingAccount: results[5],
      });

      // Sync shared state.
      const serActiveAPIs = await window.myAPI.getSharedState('activeAPIs');
      const parActiveAPIs: Map<ChainID, boolean> = JSON.parse(serActiveAPIs);
      setActiveAPIs(parActiveAPIs);
    };

    // Listen for shared state syncing.
    window.myAPI.syncSharedState(
      (
        _: IpcRendererEvent,
        { stateId, state }: { stateId: SharedStateID; state: string }
      ) => {
        switch (stateId) {
          case 'activeAPIs': {
            const parsed: Map<ChainID, boolean> = JSON.parse(state);
            setActiveAPIs(parsed);
            break;
          }
          default: {
            break;
          }
        }
      }
    );

    // Listen for synching events.
    window.myAPI.syncModeFlags(
      (
        _: IpcRendererEvent,
        { syncId, flag }: { syncId: SyncFlag; flag: boolean }
      ) => {
        switch (syncId) {
          case 'darkMode': {
            setDarkMode(flag);
            break;
          }
          case 'isConnected': {
            setIsConnected(flag);
            break;
          }
          case 'isImporting': {
            setIsImporting(flag);
            break;
          }
          case 'isOnlineMode': {
            setIsOnlineMode(flag);
            break;
          }
          case 'isBuildingExtrinsic': {
            setIsBuildingExtrinsic(flag);
            break;
          }
          case 'wc:account:approved': {
            setWcSyncFlags((pv) => ({ ...pv, wcAccountApproved: flag }));
            break;
          }
          case 'wc:connecting': {
            setWcSyncFlags((pv) => ({ ...pv, wcConnecting: flag }));
            break;
          }
          case 'wc:disconnecting': {
            setWcSyncFlags((pv) => ({ ...pv, wcDisconnecting: flag }));
            break;
          }
          case 'wc:initialized': {
            setWcSyncFlags((pv) => ({ ...pv, wcInitialized: flag }));
            break;
          }
          case 'wc:session:restored': {
            setWcSyncFlags((pv) => ({ ...pv, wcSessionRestored: flag }));
            break;
          }
          case 'wc:account:verifying': {
            setWcSyncFlags((pv) => ({ ...pv, wcVerifyingAccount: flag }));
            break;
          }
          default: {
            break;
          }
        }
      }
    );

    syncModeFlagsOnMount();
  }, []);

  /**
   * Return flag indicating whether app is in online or offline mode.
   */
  const getOnlineMode = () => isConnected && isOnlineMode;

  return (
    <ConnectionsContext.Provider
      value={{
        activeAPIs,
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
