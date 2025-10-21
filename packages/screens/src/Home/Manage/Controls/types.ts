// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubscriptionTask } from '@polkadot-live/types';

export interface NotificationsSwitchProps {
  task: SubscriptionTask;
  isChecked: boolean;
  isDisabled: (task: SubscriptionTask) => boolean;
}

export interface OneShotSwitchProps {
  task: SubscriptionTask;
  isChecked: boolean;
  isProcessing: boolean;
  isDisabled: (task: SubscriptionTask) => boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}
