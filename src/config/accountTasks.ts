import type { SubscriptionTask } from '@/types/subscriptions';

export const accountTasks: SubscriptionTask[] = [
  {
    action: 'subscribe:query.system.account',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Transfers',
  },
  {
    action: 'subscribe:nominationPools:query.system.account',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Nomination Pool Rewards',
  },
];
