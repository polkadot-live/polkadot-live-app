// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubscriptionTask } from '@/types/subscriptions';

/**
 * @name accountTasks
 * @summary A list of all possible tasks an account can subscribe to. The `SubscriptionTask`
 * type acts as the bridge between the main and renderer processes for synching and handling
 * subscriptions.
 *
 * By default, all subscription tasks are marked with status `disable`. A task is marked
 * as `enable` when it is toggled on the frontend, or fetched from the store as an
 * active task on app initialization.
 */
export const accountTasks: SubscriptionTask[] = [
  // Polkadot
  {
    action: 'subscribe:account:balance',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Transfers',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Nomination Pool Rewards',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Nomination Pool State',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Nomination Pool Renamed',
  },
  // Westend
  {
    action: 'subscribe:account:balance',
    chainId: 'Westend',
    status: 'disable',
    label: 'Transfers',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    chainId: 'Westend',
    status: 'disable',
    label: 'Nomination Pool Rewards',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    chainId: 'Westend',
    status: 'disable',
    label: 'Nomination Pool State',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    chainId: 'Westend',
    status: 'disable',
    label: 'Nomination Pool Renamed',
  },
  // Kusama
  {
    action: 'subscribe:account:balance',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Transfers',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Nomination Pool Rewards',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Nomination Pool State',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Nomination Pool Renamed',
  },
];
