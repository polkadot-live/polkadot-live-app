// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@/types/subscriptions';

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
