// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@polkadot-live/core';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import { setStateWithRef } from '@w3ux/utils';
import type { ActionMeta, AnyData, SyncID } from '@polkadot-live/types';
import type { ConnectionsAdapter } from './types';
import type { IpcRendererEvent } from 'electron';

export const electronAdapter: ConnectionsAdapter = {
  copyToClipboard: async (text) => await window.myAPI.copyToClipboard(text),

  getSharedStateOnMount: async () => {
    const map = new Map<SyncID, boolean>();
    for (const key of initSharedState().keys()) {
      const val = (await window.myAPI.getSharedState(key)) as boolean;
      map.set(key, val);
    }
    return map;
  },

  listenSharedStateOnMount: (setCache, cacheRef) => {
    window.myAPI.syncSharedState(
      (
        _: IpcRendererEvent,
        { syncId, state }: { syncId: SyncID; state: string | boolean }
      ) => {
        const map = new Map(cacheRef.current).set(syncId, state as boolean);
        setStateWithRef(map, setCache, cacheRef);
      }
    );
    return null;
  },

  initAction: (txMeta: ActionMeta) => {
    electronAdapter.isTabOpen('action').then((isOpen) => {
      if (isOpen) {
        electronAdapter.openTab('action');
        ConfigRenderer.portToAction?.postMessage({
          task: 'action:init',
          data: JSON.stringify(txMeta),
        });
      } else {
        // Cache pending extrinsic in main process.
        window.myAPI
          .sendExtrinsicsTaskAsync({
            action: 'extrinsics:addPending',
            data: { serMeta: JSON.stringify(txMeta) },
          })
          .then(() => electronAdapter.openTab('action'));
      }
    });
  },

  isTabOpen: async (tab) => await window.myAPI.isViewOpen(tab),

  openInBrowser: (uri: string, analytics?: AnyData) => {
    window.myAPI.openBrowserURL(uri);
    if (analytics) {
      window.myAPI.umamiEvent('link-open', { ...analytics });
    }
  },

  openTab: (tab, analytics) => {
    window.myAPI.openWindow(tab);
    if (analytics) {
      const { event, data } = analytics;
      window.myAPI.umamiEvent(event, data);
    }
  },

  relayState: (syncId: SyncID, state: boolean | string) =>
    window.myAPI.relaySharedState(syncId, state),

  umamiEvent: (event, data) => window.myAPI.umamiEvent(event, data),
};
