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
    apiCallAsString: 'api.query.system.account',
    chainId: 'Polkadot',
    label: 'Transfers',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    apiCallAsString: 'api.query.system.account',
    chainId: 'Polkadot',
    label: 'Nomination Pool Rewards',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    chainId: 'Polkadot',
    label: 'Nomination Pool State',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    apiCallAsString: 'api.query.nominationPools.metadata',
    chainId: 'Polkadot',
    label: 'Nomination Pool Renamed',
    status: 'disable',
  },
  // Westend
  {
    action: 'subscribe:account:balance',
    apiCallAsString: 'api.query.system.account',
    chainId: 'Westend',
    label: 'Transfers',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    apiCallAsString: 'api.query.system.account',
    chainId: 'Westend',
    label: 'Nomination Pool Rewards',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    chainId: 'Westend',
    label: 'Nomination Pool State',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    apiCallAsString: 'api.query.nominationPools.metadata',
    chainId: 'Westend',
    label: 'Nomination Pool Renamed',
    status: 'disable',
  },
  // Kusama
  {
    action: 'subscribe:account:balance',
    apiCallAsString: 'api.query.system.account',
    chainId: 'Kusama',
    label: 'Transfers',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    apiCallAsString: 'api.query.system.account',
    chainId: 'Kusama',
    label: 'Nomination Pool Rewards',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    chainId: 'Kusama',
    label: 'Nomination Pool State',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    apiCallAsString: 'api.query.nominationPools.metadata',
    chainId: 'Kusama',
    label: 'Nomination Pool Renamed',
    status: 'disable',
  },
];
