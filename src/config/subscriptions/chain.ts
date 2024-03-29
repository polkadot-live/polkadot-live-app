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
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Timestamps',
    apiCallAsString: 'api.query.timestamp.now',
  },
  {
    action: 'subscribe:chain:currentSlot',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Current Slot',
    apiCallAsString: 'api.query.babe.currentSlot',
  },
  // Westend
  {
    action: 'subscribe:chain:timestamp',
    chainId: 'Westend',
    status: 'disable',
    label: 'Timestamps',
    apiCallAsString: 'api.query.timestamp.now',
  },
  {
    action: 'subscribe:chain:currentSlot',
    chainId: 'Westend',
    status: 'disable',
    label: 'Current Slot',
    apiCallAsString: 'api.query.babe.currentSlot',
  },
  // Kusama
  {
    action: 'subscribe:chain:timestamp',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Timestamps',
    apiCallAsString: 'api.query.timestamp.now',
  },
  {
    action: 'subscribe:chain:currentSlot',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Current Slot',
    apiCallAsString: 'api.query.babe.currentSlot',
  },
];
