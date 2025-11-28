// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ChainEventsAdapter } from './types';
import type { ChainEventSubscription } from '@polkadot-live/types';

export const chromeAdapter: ChainEventsAdapter = {
  getStored: async (): Promise<Map<ChainID, ChainEventSubscription[]>> => {
    try {
      const map = new Map<ChainID, ChainEventSubscription[]>();
      const active = (await chrome.runtime.sendMessage({
        type: 'chainEvents',
        task: 'getAll',
      })) as ChainEventSubscription[];

      for (const sub of active) {
        const { chainId } = sub;
        const cur = map.get(chainId);
        cur ? map.set(chainId, [...cur, sub]) : map.set(chainId, [sub]);
      }
      return map;
    } catch (err) {
      console.error(err);
      return new Map();
    }
  },

  getStoredForAccount: async (): Promise<ChainEventSubscription[]> => [],

  getSubCount: async () =>
    await chrome.runtime.sendMessage({
      type: 'chainEvents',
      task: 'getActiveCount',
    }),

  storeInsert: (_, subscription) => {
    chrome.runtime.sendMessage({
      type: 'chainEvents',
      task: 'insert',
      payload: { sub: subscription },
    });
  },

  storeInsertForAccount: () => {
    /* empty */
  },

  storeRemove: (_, subscription) => {
    chrome.runtime.sendMessage({
      type: 'chainEvents',
      task: 'remove',
      payload: { sub: subscription },
    });
  },

  storeRemoveForAccount: () => {
    /* empty */
  },

  toggleNotify: (_, subscription) => {
    chrome.runtime.sendMessage({
      type: 'chainEvents',
      task: 'update',
      payload: { sub: subscription },
    });
  },

  toggleNotifyForAccount: () => {
    /* empty */
  },
};
