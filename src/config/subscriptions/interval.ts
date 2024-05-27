// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';

export const intervalTasks: IntervalSubscription[] = [
  // Polkadot
  {
    action: 'subscribe:interval:openGov:referendaVotes',
    ticksToWait: 1,
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
    ticksToWait: 1,
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
    ticksToWait: 1,
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
    ticksToWait: 1,
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
    ticksToWait: 1,
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
    ticksToWait: 1,
    tickCounter: 0,
    category: 'Open Gov',
    chainId: 'Kusama',
    label: 'Thresholds',
    status: 'disable',
    enableOsNotifications: true,
    helpKey: 'help:interval:openGov:referendumThresholds',
  },
];
