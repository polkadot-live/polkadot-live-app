import type { ChainID } from '@/types/chains';
import type {
  SubscriptionNextStatus,
  SubscriptionTask,
} from '@/types/subscriptions';

export const chainTasks: SubscriptionTask[] = [
  {
    action: 'subscribe:query.timestamp.now',
    actionArgs: undefined,
    chainId: 'Polkadot' as ChainID,
    status: 'disable' as SubscriptionNextStatus,
    label: 'Timestamps',
  },
  {
    action: 'subscribe:query.babe.currentSlot',
    actionArgs: undefined,
    chainId: 'Polkadot' as ChainID,
    status: 'disable' as SubscriptionNextStatus,
    label: 'Current Slot',
  },
];
