// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainEventSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface NetworksProps {
  setActiveChain: React.Dispatch<React.SetStateAction<ChainID | null>>;
  setBreadcrumb: React.Dispatch<React.SetStateAction<string>>;
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export interface SubscriptionsProps {
  breadcrumb: string;
  subscriptions: ChainEventSubscription[];
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export interface SubscriptionRowProps {
  subscription: ChainEventSubscription;
}

export interface SubscriptionRowAccountProps {
  subscription: ChainEventSubscription;
}
