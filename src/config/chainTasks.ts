import type { SubscriptionTask } from '@/types/subscriptions';

export const chainTasks: SubscriptionTask[] = [
  {
    action: 'subscribe:query.timestamp.now',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Timestamps',
  },
  {
    action: 'subscribe:query.babe.currentSlot',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Current Slot',
  },
];
