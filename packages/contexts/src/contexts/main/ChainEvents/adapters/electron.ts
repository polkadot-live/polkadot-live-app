// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsService, parseMap } from '@polkadot-live/core';
import type { ChainEventSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ChainEventsAdapter } from './types';

export const electronAdapter: ChainEventsAdapter = {
  getStored: async (): Promise<Map<ChainID, ChainEventSubscription[]>> =>
    parseMap<ChainID, ChainEventSubscription[]>(
      (await window.myAPI.sendChainEventTask({
        action: 'chainEvents:getAll',
        data: null,
      })) ?? '[]'
    ),

  storeInsert: (chainId, subscription) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:insert',
      data: { chainId, subscription },
    });
    ChainEventsService.insert(chainId, subscription);
    ChainEventsService.initEventStream(chainId);
  },

  storeRemove: (chainId, subscription) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:remove',
      data: { chainId, subscription },
    });
    ChainEventsService.remove(chainId, subscription);
    ChainEventsService.tryStopEventsStream(chainId);
  },

  toggleNotify: (chainId, subscription) => {
    window.myAPI.sendChainEventTask({
      action: 'chainEvents:insert',
      data: { chainId, subscription },
    });
    ChainEventsService.update(chainId, subscription);
  },
};
