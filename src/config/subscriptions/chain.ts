// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
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
    action: 'subscribe:chain:timestamp',
    apiCallAsString: 'api.query.timestamp.now',
    category: 'Chain',
    chainId: 'Polkadot',
    label: 'Timestamps',
    status: 'disable',
  },
  {
    action: 'subscribe:chain:currentSlot',
    apiCallAsString: 'api.query.babe.currentSlot',
    category: 'Chain',
    chainId: 'Polkadot',
    label: 'Current Slot',
    status: 'disable',
  },
  // Kusama
  {
    action: 'subscribe:chain:timestamp',
    apiCallAsString: 'api.query.timestamp.now',
    category: 'Chain',
    chainId: 'Kusama',
    label: 'Timestamps',
    status: 'disable',
  },
  {
    action: 'subscribe:chain:currentSlot',
    apiCallAsString: 'api.query.babe.currentSlot',
    category: 'Chain',
    chainId: 'Kusama',
    label: 'Current Slot',
    status: 'disable',
  },
  // Westend
  {
    action: 'subscribe:chain:timestamp',
    apiCallAsString: 'api.query.timestamp.now',
    category: 'Chain',
    chainId: 'Westend',
    label: 'Timestamps',
    status: 'disable',
  },
  {
    apiCallAsString: 'api.query.babe.currentSlot',
    action: 'subscribe:chain:currentSlot',
    category: 'Chain',
    chainId: 'Westend',
    label: 'Current Slot',
    status: 'disable',
  },
];
