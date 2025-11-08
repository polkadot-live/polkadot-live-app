// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getAllAccountSubscriptions } from './subscriptionQueries';
import { getSupportedChains } from '@polkadot-live/consts/chains';
import { sendChromeMessage } from '../utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const getActiveChains = async (map: Map<string, SubscriptionTask[]>) => {
  const active = new Map<ChainID, number>();
  for (const [key, tasks] of map.entries()) {
    const chainId = key.split(':')[0] as ChainID;
    active.set(
      chainId,
      tasks.reduce((acc, t) => (t.status === 'enable' ? acc + 1 : acc), 0)
    );
  }
  for (const chainId of Object.keys(getSupportedChains()) as ChainID[]) {
    if (!active.has(chainId)) {
      active.set(chainId, 0);
    }
  }
  return active;
};

export const setAccountSubscriptionsState = async () => {
  const map = await getAllAccountSubscriptions();
  const active = await getActiveChains(map);
  sendChromeMessage('subscriptions', 'setAccountSubscriptions', {
    subscriptions: JSON.stringify(Array.from(map.entries())),
    activeChains: JSON.stringify(Array.from(active.entries())),
  });
};
