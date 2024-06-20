// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  IntervalSetting,
  IntervalSubscription,
} from '@/types/subscriptions';

/// Total interval subscription tasks for a referendum.
export const NUM_REFERENDUM_SUBSCRIPTIONS = 3;

/// Selectable durations for an interval subscription.
export const intervalDurationsConfig: IntervalSetting[] = [
  { label: '15 minutes', ticksToWait: 1 },
  { label: '30 minutes', ticksToWait: 2 },
  { label: '1 hour', ticksToWait: 4 },
  { label: '2 hours', ticksToWait: 8 },
  { label: '4 hours', ticksToWait: 16 },
  { label: '6 hours', ticksToWait: 24 },
  { label: '12 hours', ticksToWait: 48 },
  { label: '24 hours', ticksToWait: 96 },
];

/// Interval subscription tasks.
export const intervalTasks: IntervalSubscription[] = [
  // Polkadot
  {
    action: 'subscribe:interval:openGov:referendumVotes',
    intervalSetting: { label: '15 minutes', ticksToWait: 1 },
    tickCounter: 0,
    category: 'Open Gov',
    chainId: 'Polkadot',
    label: 'Votes Tally',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:referendumVotes',
  },
  {
    action: 'subscribe:interval:openGov:decisionPeriod',
    intervalSetting: { label: '15 minutes', ticksToWait: 1 },
    tickCounter: 0,
    category: 'Open Gov',
    chainId: 'Polkadot',
    label: 'Decision Period',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:decisionPeriod',
  },
  {
    action: 'subscribe:interval:openGov:referendumThresholds',
    intervalSetting: { label: '15 minutes', ticksToWait: 1 },
    tickCounter: 0,
    category: 'Open Gov',
    chainId: 'Polkadot',
    label: 'Thresholds',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:referendumThresholds',
  },
  // Kusama
  {
    action: 'subscribe:interval:openGov:referendumVotes',
    intervalSetting: { label: '15 minutes', ticksToWait: 1 },
    tickCounter: 0,
    category: 'Open Gov',
    chainId: 'Kusama',
    label: 'Votes Tally',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:referendumVotes',
  },
  {
    action: 'subscribe:interval:openGov:decisionPeriod',
    intervalSetting: { label: '15 minutes', ticksToWait: 1 },
    tickCounter: 0,
    category: 'Open Gov',
    chainId: 'Kusama',
    label: 'Decision Period',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:decisionPeriod',
  },
  {
    action: 'subscribe:interval:openGov:referendumThresholds',
    intervalSetting: { label: '15 minutes', ticksToWait: 1 },
    tickCounter: 0,
    category: 'Open Gov',
    chainId: 'Kusama',
    label: 'Thresholds',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:referendumThresholds',
  },
];
