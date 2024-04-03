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
    category: 'Balances',
    chainId: 'Polkadot',
    label: 'Transfers',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    apiCallAsString: 'api.query.system.account',
    chainId: 'Polkadot',
    category: 'Nomination Pools',
    label: 'Unclaimed Rewards',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    chainId: 'Polkadot',
    category: 'Nomination Pools',
    label: 'Pool State Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    apiCallAsString: 'api.query.nominationPools.metadata',
    chainId: 'Polkadot',
    category: 'Nomination Pools',
    label: 'Pool Name Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:roles',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    chainId: 'Polkadot',
    category: 'Nomination Pools',
    label: 'Roles Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:commission',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Polkadot',
    label: 'Commission Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:rewards',
    apiCallAsString: 'api.query.staking.currentEra',
    category: 'Nominating',
    chainId: 'Polkadot',
    label: 'Unclaimed Rewards',
    status: 'disable',
  },
  // Westend
  {
    action: 'subscribe:account:balance',
    apiCallAsString: 'api.query.system.account',
    category: 'Balances',
    chainId: 'Westend',
    label: 'Transfers',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    apiCallAsString: 'api.query.system.account',
    category: 'Nomination Pools',
    chainId: 'Westend',
    label: 'Unclaimed Rewards',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Westend',
    label: 'State Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    apiCallAsString: 'api.query.nominationPools.metadata',
    category: 'Nomination Pools',
    chainId: 'Westend',
    label: 'Pool Name Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:roles',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Westend',
    label: 'Roles Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:commission',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Westend',
    label: 'Commission Changed',
    status: 'disable',
  },
  // Kusama
  {
    action: 'subscribe:account:balance',
    apiCallAsString: 'api.query.system.account',
    category: 'Balances',
    chainId: 'Kusama',
    label: 'Transfers',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    apiCallAsString: 'api.query.system.account',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    label: 'Unclaimed Rewards',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    label: 'State Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    apiCallAsString: 'api.query.nominationPools.metadata',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    label: 'Pool Name Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:roles',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    label: 'Roles Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:commission',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    label: 'Commission Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:rewards',
    apiCallAsString: 'api.query.staking.currentEra',
    category: 'Nominating',
    chainId: 'Kusama',
    label: 'Unclaimed Rewards',
    status: 'disable',
  },
];
