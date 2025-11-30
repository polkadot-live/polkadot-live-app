// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsService, parseMap } from '@polkadot-live/core';
import type { ChainEventSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ChainEventsAdapter } from './types';

export const electronAdapter: ChainEventsAdapter = {
  listenOnMount: () => null,

  getStored: async (): Promise<Map<ChainID, ChainEventSubscription[]>> =>
    parseMap<ChainID, ChainEventSubscription[]>(
      (await window.myAPI.sendChainEventTask({
        action: 'chainEvents:getAll',
        data: null,
      })) ?? '[]'
    ),

  getStoredForAccount: async (account): Promise<ChainEventSubscription[]> => {
    try {
      const res = (await window.myAPI.sendChainEventTask({
        action: 'chainEvents:getAllForAccount',
        data: { account },
      })) as string;
      return JSON.parse(res);
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  getSubCount: async () => {
    const res = await window.myAPI.sendChainEventTask({
      action: 'chainEvents:getActiveCount',
      data: null,
    });
    return res ? parseInt(res) : 0;
  },

  storeInsert: (chainId, subscription) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:insert',
      data: { chainId, subscription },
    });
    ChainEventsService.insert(chainId, subscription);
    ChainEventsService.initEventStream(chainId);
  },

  storeInsertForAccount: (account, subscription) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:insertForAccount',
      data: { account, subscription },
    });
    ChainEventsService.insertForAccount(account, subscription);
    ChainEventsService.initEventStream(account.chain);
  },

  storeRemove: (chainId, subscription) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:remove',
      data: { chainId, subscription },
    });
    ChainEventsService.remove(chainId, subscription);
    ChainEventsService.tryStopEventsStream(chainId);
  },

  storeRemoveForAccount: (account, subscription) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:removeForAccount',
      data: { account, subscription },
    });
    ChainEventsService.removeForAccount(account, subscription);
    ChainEventsService.tryStopEventsStream(account.chain);
  },

  storeRemoveAllForAccount: (account) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:removeAllForAccount',
      data: { account },
    });
  },

  toggleNotify: (chainId, subscription) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:insert',
      data: { chainId, subscription },
    });
    ChainEventsService.update(chainId, subscription);
  },

  toggleNotifyForAccount: (account, subscription) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:insertForAccount',
      data: { account, subscription },
    });
    ChainEventsService.updateForAccount(account, subscription);
  },
};
