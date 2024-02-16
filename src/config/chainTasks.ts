import type { SubscriptionTask } from '@/types/subscriptions';

export const chainTasks: SubscriptionTask[] = [
  {
    action: 'subscribe:query.timestamp.now',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Timestamps (Polkadot)',
  },
  {
    action: 'subscribe:query.babe.currentSlot',
    chainId: 'Polkadot',
    status: 'disable',
    label: 'Current Slot (Polkadot)',
  },
  {
    action: 'subscribe:query.timestamp.now',
    chainId: 'Westend',
    status: 'disable',
    label: 'Timestamps (Westend)',
  },
  {
    action: 'subscribe:query.babe.currentSlot',
    chainId: 'Westend',
    status: 'disable',
    label: 'Current Slot (Westend)',
  },
];
