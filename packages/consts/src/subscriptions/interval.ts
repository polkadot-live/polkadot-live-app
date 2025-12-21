// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  IntervalSetting,
  IntervalSubscription,
} from '@polkadot-live/types/subscriptions';

/// Selectable durations for an interval subscription.
export const intervalDurationsConfig: IntervalSetting[] = [
  { label: '15 minutes', ticksToWait: 1 },
  { label: '30 minutes', ticksToWait: 2 },
  { label: '60 minutes', ticksToWait: 4 },
  { label: '2 hours', ticksToWait: 8 },
  { label: '4 hours', ticksToWait: 16 },
  { label: '6 hours', ticksToWait: 24 },
  { label: '12 hours', ticksToWait: 48 },
  { label: '24 hours', ticksToWait: 96 },
];

/// Interval subscription tasks.
export const intervalTasks: IntervalSubscription[] = [
  // Polkadot Asset Hub
  {
    action: 'subscribe:interval:openGov:referendumVotes',
    intervalSetting: { label: '60 minutes', ticksToWait: 4 },
    tickCounter: 0,
    category: 'OpenGov',
    chainId: 'Polkadot Asset Hub',
    label: 'Votes Tally',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:referendumVotes',
  },
  {
    action: 'subscribe:interval:openGov:decisionPeriod',
    intervalSetting: { label: '60 minutes', ticksToWait: 4 },
    tickCounter: 0,
    category: 'OpenGov',
    chainId: 'Polkadot Asset Hub',
    label: 'Decision Period',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:decisionPeriod',
  },
  {
    action: 'subscribe:interval:openGov:referendumThresholds',
    intervalSetting: { label: '60 minutes', ticksToWait: 4 },
    tickCounter: 0,
    category: 'OpenGov',
    chainId: 'Polkadot Asset Hub',
    label: 'Thresholds',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:referendumThresholds',
  },
  // Kusama Asset Hub
  {
    action: 'subscribe:interval:openGov:referendumVotes',
    intervalSetting: { label: '60 minutes', ticksToWait: 4 },
    tickCounter: 0,
    category: 'OpenGov',
    chainId: 'Kusama Asset Hub',
    label: 'Votes Tally',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:referendumVotes',
  },
  {
    action: 'subscribe:interval:openGov:decisionPeriod',
    intervalSetting: { label: '60 minutes', ticksToWait: 4 },
    tickCounter: 0,
    category: 'OpenGov',
    chainId: 'Kusama Asset Hub',
    label: 'Decision Period',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:decisionPeriod',
  },
  {
    action: 'subscribe:interval:openGov:referendumThresholds',
    intervalSetting: { label: '60 minutes', ticksToWait: 4 },
    tickCounter: 0,
    category: 'OpenGov',
    chainId: 'Kusama Asset Hub',
    label: 'Thresholds',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:referendumThresholds',
  },
];
