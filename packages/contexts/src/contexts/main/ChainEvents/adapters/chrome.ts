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
        task: 'chainEvents:getAll',
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

  storeInsert: (_, subscription) => {
    chrome.runtime.sendMessage({
      type: 'chainEvents',
      task: 'chainEvents:insert',
      payload: { sub: subscription },
    });
  },

  storeRemove: (_, subscription) => {
    chrome.runtime.sendMessage({
      type: 'chainEvents',
      task: 'chainEvents:remove',
      payload: { sub: subscription },
    });
  },

  toggleNotify: (_, subscription) => {
    chrome.runtime.sendMessage({
      type: 'chainEvents',
      task: 'chainEvents:update',
      payload: { sub: subscription },
    });
  },
};
