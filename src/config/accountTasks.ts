import type { SubscriptionTask } from '@/types/subscriptions';

export const accountTasks: SubscriptionTask[] = [
  // Polkadot
  {
    action: 'subscribe:query.system.account',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Transfers (Polkadot)',
  },
  {
    action: 'subscribe:nominationPools:query.system.account',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Nomination Pool Rewards (Polkadot)',
  },
  // Westend
  {
    action: 'subscribe:query.system.account',
    chainId: 'Westend',
    status: 'disable',
    label: 'Transfers (Westend)',
  },
  {
    action: 'subscribe:nominationPools:query.system.account',
    chainId: 'Westend',
    status: 'disable',
    label: 'Nomination Pool Rewards (Westend)',
  },
  // Kusama
  {
    action: 'subscribe:query.system.account',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Transfers (Kusama)',
  },
  {
    action: 'subscribe:nominationPools:query.system.account',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Nomination Pool Rewards (Kusama)',
  },
];
