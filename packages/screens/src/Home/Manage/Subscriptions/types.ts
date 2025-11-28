// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  SubscriptionTask,
  SubscriptionTaskType,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ClassicSubscriptionProps {
  task: SubscriptionTask;
  getDisabled: (task: SubscriptionTask) => boolean;
}

export interface ClassicSubscriptionsProps {
  typeClicked: SubscriptionTaskType;
  section: number;
  updateAccordionValue: boolean;
  setSection: (n: number) => void;
}

export interface SubscriptionsProps {
  breadcrumb: string;
  section: number;
  tasksChainId: ChainID | null;
  typeClicked: SubscriptionTaskType;
  setSection: (n: number) => void;
}
