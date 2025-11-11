// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ActionMeta,
  AnyData,
  SyncID,
  TabData,
} from '@polkadot-live/types';
import { setStateWithRef } from '@w3ux/utils';
import type { ConnectionsAdapter } from './types';

export const chromeAdapter: ConnectionsAdapter = {
  copyToClipboard: async (text) => await navigator.clipboard.writeText(text),

  getSharedStateOnMount: async () => {
    const msg = { type: 'sharedState', task: 'get' };
    const ser = await chrome.runtime.sendMessage(msg);
    const array: [SyncID, boolean][] = JSON.parse(ser);
    const map = new Map<SyncID, boolean>(array);
    return map;
  },

  listenSharedStateOnMount: (setCache, cacheRef) => {
    const callback = (message: AnyData) => {
      if (message.type === 'sharedState') {
        switch (message.task) {
          case 'set': {
            const { key, value }: { key: SyncID; value: boolean } =
              message.payload;
            const map = new Map(cacheRef.current).set(key, value);
            setStateWithRef(map, setCache, cacheRef);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },

  isTabOpen: async (tab) => {
    const msg = { type: 'tabs', task: 'isTabOpen', tab };
    return (await chrome.runtime.sendMessage(msg)) as boolean;
  },

  initAction: (txMeta: ActionMeta) =>
    chrome.runtime.sendMessage({
      type: 'extrinsics',
      task: 'initTxRelay',
      payload: { actionMeta: txMeta },
    }),

  openInBrowser: (uri: string, analytics?: AnyData) => {
    chrome.tabs.create({ url: uri });
    if (analytics) {
      // TODO: Implement
    }
  },

  openTab: (tab) => {
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
  },

  relayState: (syncId: SyncID, state: boolean | string) => {
    const { key, value } = { key: syncId, value: state as boolean };
    const msg = { type: 'sharedState', task: 'relay', payload: { key, value } };
    chrome.runtime.sendMessage(msg);
  },

  umamiEvent: () => {
    /* empty */
  },
};
