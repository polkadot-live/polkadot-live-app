// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '@polkadot-live/styles/theme/variables';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import { createContext, useEffect, useRef, useState } from 'react';
import { setStateWithRef } from '@w3ux/utils';
import type { AnyData } from 'packages/types/src';
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
   * Open a tab.
   */
  const openTab = (
    tab: string,
    analytics?: { event: string; data: AnyData | null }
  ) => {
    window.myAPI.openWindow(tab);
    if (analytics) {
      window.myAPI.umamiEvent('window-open-accounts', null);
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
        openInBrowser,
        openTab,
        setShared: () => {
          /* empty */
        },
      }}
    >
      {children}
    </ConnectionsContext>
  );
};
