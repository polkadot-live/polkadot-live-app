import type { SubscriptionTask } from '@/types/subscriptions';

export const chainTasks: SubscriptionTask[] = [
  // Polkadot
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
  // Westend
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
  // Kusama
  {
    action: 'subscribe:query.timestamp.now',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Timestamps (Kusama)',
  },
  {
    action: 'subscribe:query.babe.currentSlot',
    chainId: 'Kusama',
    status: 'disable',
    label: 'Current Slot (Kusama)',
  },
];
