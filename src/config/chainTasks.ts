// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubscriptionTask } from '@/types/subscriptions';

/**
 * @name chainTasks
 * @summary A list of all possible chain tasks that can be subscribed to. The `SubscriptionTask`
 * type acts as the bridge between the main and renderer processes for synching and handling
 * subscriptions.
 *
 * By default, all subscription tasks are marked with status `disable`. A task is marked
 * as `enable` when it is toggled on the frontend, or fetched from the store as an
 * active task on app initialization.
 */
export const chainTasks: SubscriptionTask[] = [
  // Polkadot
  {
    action: 'subscribe:query.timestamp.now',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Timestamps (Polkadot)',
  },
  {
    action: 'subscribe:query.babe.currentSlot',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Current Slot (Polkadot)',
  },
  // Westend
  {
    action: 'subscribe:query.timestamp.now',
    chainId: 'Westend',
    status: 'disable',
    label: 'Timestamps (Westend)',
  },
  {
    action: 'subscribe:query.babe.currentSlot',
    chainId: 'Westend',
    status: 'disable',
    label: 'Current Slot (Westend)',
  },
  // Kusama
  {
    action: 'subscribe:query.timestamp.now',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Timestamps (Kusama)',
  },
  {
    action: 'subscribe:query.babe.currentSlot',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Current Slot (Kusama)',
  },
];
