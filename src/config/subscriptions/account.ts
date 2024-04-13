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
    enableOsNotifications: false,
    label: 'Transfers',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    apiCallAsString: 'api.query.system.account',
    category: 'Nomination Pools',
    chainId: 'Polkadot',
    enableOsNotifications: false,
    label: 'Unclaimed Rewards',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Polkadot',
    enableOsNotifications: false,
    label: 'Pool State Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    apiCallAsString: 'api.query.nominationPools.metadata',
    category: 'Nomination Pools',
    chainId: 'Polkadot',
    enableOsNotifications: false,
    label: 'Pool Name Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:roles',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Polkadot',
    enableOsNotifications: false,
    label: 'Roles Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:commission',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Polkadot',
    enableOsNotifications: false,
    label: 'Commission Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:pendingPayouts',
    apiCallAsString: 'api.query.staking.activeEra',
    category: 'Nominating',
    chainId: 'Polkadot',
    enableOsNotifications: false,
    label: 'Pending Payouts',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:exposure',
    apiCallAsString: 'api.query.staking.activeEra',
    category: 'Nominating',
    chainId: 'Polkadot',
    enableOsNotifications: false,
    label: 'Exposure Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:commission',
    apiCallAsString: 'api.query.staking.activeEra',
    category: 'Nominating',
    chainId: 'Polkadot',
    enableOsNotifications: false,
    label: 'Commission Changed',
    status: 'disable',
  },
  // Kusama
  {
    action: 'subscribe:account:balance',
    apiCallAsString: 'api.query.system.account',
    category: 'Balances',
    chainId: 'Kusama',
    enableOsNotifications: false,
    label: 'Transfers',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    apiCallAsString: 'api.query.system.account',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    enableOsNotifications: true,
    label: 'Unclaimed Rewards',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    enableOsNotifications: false,
    label: 'State Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    apiCallAsString: 'api.query.nominationPools.metadata',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    enableOsNotifications: false,
    label: 'Pool Name Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:roles',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    enableOsNotifications: false,
    label: 'Roles Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:commission',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Kusama',
    enableOsNotifications: false,
    label: 'Commission Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:pendingPayouts',
    apiCallAsString: 'api.query.staking.activeEra',
    category: 'Nominating',
    chainId: 'Kusama',
    enableOsNotifications: false,
    label: 'Pending Payouts',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:exposure',
    apiCallAsString: 'api.query.staking.activeEra',
    category: 'Nominating',
    chainId: 'Kusama',
    enableOsNotifications: false,
    label: 'Exposure Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:commission',
    apiCallAsString: 'api.query.staking.activeEra',
    category: 'Nominating',
    chainId: 'Kusama',
    enableOsNotifications: false,
    label: 'Commission Changed',
    status: 'disable',
  },
  // Westend
  {
    action: 'subscribe:account:balance',
    apiCallAsString: 'api.query.system.account',
    category: 'Balances',
    chainId: 'Westend',
    enableOsNotifications: false,
    label: 'Transfers',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:rewards',
    apiCallAsString: 'api.query.system.account',
    category: 'Nomination Pools',
    chainId: 'Westend',
    enableOsNotifications: false,
    label: 'Unclaimed Rewards',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:state',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Westend',
    enableOsNotifications: false,
    label: 'State Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:renamed',
    apiCallAsString: 'api.query.nominationPools.metadata',
    category: 'Nomination Pools',
    chainId: 'Westend',
    enableOsNotifications: false,
    label: 'Pool Name Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:roles',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Westend',
    enableOsNotifications: false,
    label: 'Roles Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominationPools:commission',
    apiCallAsString: 'api.query.nominationPools.bondedPools',
    category: 'Nomination Pools',
    chainId: 'Westend',
    enableOsNotifications: false,
    label: 'Commission Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:pendingPayouts',
    apiCallAsString: 'api.query.staking.activeEra',
    category: 'Nominating',
    chainId: 'Westend',
    enableOsNotifications: false,
    label: 'Pending Payouts',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:exposure',
    apiCallAsString: 'api.query.staking.activeEra',
    category: 'Nominating',
    chainId: 'Westend',
    enableOsNotifications: false,
    label: 'Exposure Changed',
    status: 'disable',
  },
  {
    action: 'subscribe:account:nominating:commission',
    apiCallAsString: 'api.query.staking.activeEra',
    category: 'Nominating',
    chainId: 'Westend',
    enableOsNotifications: false,
    label: 'Commission Changed',
    status: 'disable',
  },
];
