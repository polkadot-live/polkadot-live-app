// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '@polkadot-live/styles/theme/variables';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { createContext, useEffect, useRef, useState } from 'react';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import { setStateWithRef } from '@w3ux/utils';
import type { ActionMeta } from '@polkadot-live/types/tx';
import type { AnyData } from '@polkadot-live/types/misc';
import type { SyncID, TabData } from '@polkadot-live/types/communication';
import type { ConnectionsContextInterface } from '@polkadot-live/contexts/types/common';

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
    const { key, value } = { key: syncId, value: state as boolean };
    const msg = { type: 'sharedState', task: 'relay', payload: { key, value } };
    chrome.runtime.sendMessage(msg);
  };

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
    await navigator.clipboard.writeText(text);

  /**
   * Open URL in browser.
   */
  const openInBrowser = (uri: string, analytics?: AnyData) => {
    chrome.tabs.create({ url: uri });
    if (analytics) {
      // TODO: Implement
    }
  };

  /**
   * Checks if a tab is open.
   */
  const isTabOpen = async (tab: string) => {
    const msg = { type: 'tabs', task: 'isTabOpen', tab };
    return (await chrome.runtime.sendMessage(msg)) as boolean;
  };

  /**
   * Message to initialize a transaction in the extrinsics tab.
   */
  const initExtrinsicMsg = (txMeta: ActionMeta) => {
    relayState('extrinsic:building', true);
    chrome.runtime.sendMessage({
      type: 'extrinsics',
      task: 'initTxRelay',
      payload: { actionMeta: txMeta },
    });
  };

  /**
   * Open tab.
   */
  const openTab = (tab: string) => {
    const labels: Record<string, string> = {
      import: 'Accounts',
      action: 'Extrinsics',
      openGov: 'OpenGov',
      settings: 'Settings',
    };
    const label = labels[tab];
    const tabData: TabData = { id: -1, viewId: tab, label };
    const data = { type: 'tabs', task: 'openTabRelay', payload: { tabData } };
    chrome.runtime.sendMessage(data).then(() => window.close());
  };

  useEffect(() => {
    /**
     * Synchronize flags in store.
     */
    const sync = async () => {
      const msg = { type: 'sharedState', task: 'get' };
      const ser = await chrome.runtime.sendMessage(msg);
      const array: [SyncID, boolean][] = JSON.parse(ser);
      const map = new Map<SyncID, boolean>(array);
      setStateWithRef(map, setCache, cacheRef);
    };

    // Listen for shared state syncing.
    const callback = (message: AnyData) => {
      if (message.type === 'sharedState' && message.task === 'set') {
        const { key, value }: { key: SyncID; value: boolean } = message.payload;
        const map = new Map(cacheRef.current).set(key, value);
        setStateWithRef(map, setCache, cacheRef);
      }
    };

    sync();
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, []);

  return (
    <ConnectionsContext
      value={{
        stateLoaded: true,
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
