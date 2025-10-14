// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '@polkadot-live/styles/theme/variables';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { createContext, useEffect, useRef, useState } from 'react';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import { setStateWithRef } from '@w3ux/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ConnectionsContextInterface } from './types';
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
   * Cache a new shared value.
   */
  const setShared = (key: SyncID, value: boolean) => {
    const msg = { type: 'sharedState', task: 'relay', payload: { key, value } };
    chrome.runtime.sendMessage(msg);
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
        cacheGet,
        copyToClipboard,
        getOnlineMode,
        getTheme,
        openInBrowser,
        setShared,
      }}
    >
      {children}
    </ConnectionsContext>
  );
};
