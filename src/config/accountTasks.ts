import type { ChainID } from '@/types/chains';
import type {
  SubscriptionNextStatus,
  SubscriptionTask,
} from '@/types/subscriptions';

export const accountTasks: SubscriptionTask[] = [
  {
    action: 'subscribe:query.system.account',
    actionArgs: undefined,
    chainId: 'Polkadot' as ChainID,
    status: 'disable' as SubscriptionNextStatus,
    label: 'Transfers',
  },
];
