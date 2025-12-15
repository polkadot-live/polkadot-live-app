// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export interface IntervalRowProps {
  task: IntervalSubscription;
}

export interface NetworksProps {
  section: number;
  setBreadcrumb: React.Dispatch<React.SetStateAction<string>>;
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export interface SubscriptionsProps {
  breadcrumb: string;
  setSection: React.Dispatch<React.SetStateAction<number>>;
}
