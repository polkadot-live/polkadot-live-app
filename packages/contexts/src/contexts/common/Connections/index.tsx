// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '@polkadot-live/styles/theme/variables';
import { createSafeContextHook } from '../../../utils';
import { createContext, useEffect, useRef, useState } from 'react';
import { getConnectionsAdapter } from './adapters';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import { setStateWithRef } from '@w3ux/utils';
import type { ActionMeta } from '@polkadot-live/types/tx';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ConnectionsContextInterface } from '../../../types/common';
import type { SyncID } from '@polkadot-live/types/communication';

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
  const adapter = getConnectionsAdapter();

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
  const relayState = (syncId: SyncID, state: boolean | string) =>
    adapter.relayState(syncId, state);

  /**
   * Return flag indicating whether app is in online or offline mode.
   */
  const getOnlineMode = () =>
    cacheGet('mode:connected') && cacheGet('mode:online');

  /**
   * Get theme object.
   */
  const getTheme = (): typeof themeVariables.darkTheme => {
    const { darkTheme, lightTheme } = themeVariables;
    return cacheGet('mode:dark') ? darkTheme : lightTheme;
  };

  /**
   * Copy to clipboard.
   */
  const copyToClipboard = async (text: string) =>
    await adapter.copyToClipboard(text);

  /**
   * Open URL in browser.
   */
  const openInBrowser = (uri: string, analytics?: AnyData) =>
    adapter.openInBrowser(uri, analytics);

  /**
   * Checks if a tab is open.
   */
  const isTabOpen = async (tab: string) => await adapter.isTabOpen(tab);

  /**
   * Message to initialize a transaction in the extrinsics tab.
   */
  const initExtrinsicMsg = (txMeta: ActionMeta) => {
    adapter.relayState('extrinsic:building', true);
    adapter.initAction(txMeta);
  };

  /**
   * Open tab.
   */
  const openTab = (
    tab: string,
    analytics?: { event: string; data: AnyData | null }
  ) => adapter.openTab(tab, analytics);

  useEffect(() => {
    // Synchronize with stored flags.
    const sync = async () => {
      const map = await adapter.getSharedStateOnMount();
      setStateWithRef(map, setCache, cacheRef);
    };

    // Listen for shared state syncing.
    const removeListener = adapter.listenSharedStateOnMount(setCache, cacheRef);
    sync().then(() => setStateLoaded(true));
    return () => {
      removeListener && removeListener();
    };
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
