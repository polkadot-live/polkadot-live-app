// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '@polkadot-live/styles/theme/variables';
import { ConfigRenderer } from '@polkadot-live/core';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import { createContext, useEffect, useRef, useState } from 'react';
import { setStateWithRef } from '@w3ux/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ActionMeta } from '@polkadot-live/types/tx';
import type { ConnectionsContextInterface } from '@polkadot-live/contexts/types/common';
import type { IpcRendererEvent } from 'electron';
import type { SyncID } from '@polkadot-live/types/communication';

/**
 * Automatically listens for and sets shared state when the state is
 * updated in other processes.
 *
 * Keeps state synchronized between processes.
 */
export const ConnectionsContext = createContext<
  ConnectionsContextInterface | undefined
>(undefined);

export const useConnections = createSafeContextHook(
  ConnectionsContext,
  'ConnectionsContext'
);

export const ConnectionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   * Cache to control rendering logic only.
   */
  const [stateLoaded, setStateLoaded] = useState(false);
  const [cache, setCache] = useState(initSharedState());
  const cacheRef = useRef(cache);

  /**
   * Get a cached value.
   */
  const cacheGet = (key: SyncID): boolean => Boolean(cacheRef.current.get(key));

  /**
   * Relay shared state.
   */
  const relayState = (syncId: SyncID, state: boolean | string) => {
    window.myAPI.relaySharedState(syncId, state);
  };

  /**
   * Return flag indicating whether app is in online or offline mode.
   */
  const getOnlineMode = () =>
    cacheGet('mode:connected') && cacheGet('mode:online');

  /**
   * Get theme variables.
   */
  const getTheme = (): typeof themeVariables.darkTheme => {
    const { darkTheme, lightTheme } = themeVariables;
    return cacheGet('mode:dark') ? darkTheme : lightTheme;
  };

  /**
   * Copy to clipboard.
   */
  const copyToClipboard = async (text: string) =>
    await window.myAPI.copyToClipboard(text);

  /**
   * Open URL in browser.
   */
  const openInBrowser = (uri: string, analytics?: AnyData) => {
    window.myAPI.openBrowserURL(uri);
    if (analytics) {
      window.myAPI.umamiEvent('link-open', { ...analytics });
    }
  };

  /**
   * Checks if a tab is open.
   */
  const isTabOpen = async (tab: string) => await window.myAPI.isViewOpen(tab);

  /**
   * Message to initialize a transaction in the extrinsics tab.
   * @todo Move to extrinsics context.
   */
  const initExtrinsicMsg = (txMeta: ActionMeta) => {
    ConfigRenderer.portToAction?.postMessage({
      task: 'action:init',
      data: JSON.stringify(txMeta),
    });
  };

  /**
   * Open a tab.
   */
  const openTab = (
    tab: string,
    relayData?: AnyData, // electron
    analytics?: { event: string; data: AnyData | null }
  ) => {
    relayData
      ? window.myAPI.openWindow(tab, relayData)
      : window.myAPI.openWindow(tab);

    if (analytics) {
      const { event, data } = analytics;
      window.myAPI.umamiEvent(event, data);
    }
  };

  useEffect(() => {
    /**
     * Synchronize flags in store.
     */
    const sync = async () => {
      // TODO: Optimise with one IPC.
      const map: typeof cache = new Map();
      for (const key of initSharedState().keys()) {
        const val = (await window.myAPI.getSharedState(key)) as boolean;
        map.set(key, val);
      }
      setStateWithRef(map, setCache, cacheRef);
      setStateLoaded(true);
    };

    /**
     * Listen for shared state syncing.
     */
    window.myAPI.syncSharedState(
      (
        _: IpcRendererEvent,
        { syncId, state }: { syncId: SyncID; state: string | boolean }
      ) => {
        const map = new Map(cacheRef.current).set(syncId, state as boolean);
        setStateWithRef(map, setCache, cacheRef);
      }
    );

    sync();
  }, []);

  return (
    <ConnectionsContext
      value={{
        stateLoaded,
        cacheGet,
        copyToClipboard,
        getOnlineMode,
        getTheme,
        initExtrinsicMsg,
        isTabOpen,
        openInBrowser,
        openTab,
        relayState,
      }}
    >
      {children}
    </ConnectionsContext>
  );
};
