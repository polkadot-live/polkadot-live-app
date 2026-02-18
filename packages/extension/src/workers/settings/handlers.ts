// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SubscriptionsController } from '@polkadot-live/core';
import { DbController } from '../../controllers';
import {
  setChainSubscriptionsState,
  updateChainSubscriptions,
} from '../chainSubscriptions';
import type { SettingItem } from '@polkadot-live/types/settings';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const handleDebuggingSubscriptions = async (setting: SettingItem) => {
  if (setting.enabled) {
    return;
  }
  // Unsubscribe from any active debugging subscriptions.
  for (const tasks of SubscriptionsController.getChainSubscriptions().values()) {
    const active = tasks
      .filter((t) => t.status === 'enable')
      .map((t) => ({ ...t, status: 'disable' }) as SubscriptionTask);
    if (active.length === 0) {
      continue;
    }
    await updateChainSubscriptions(active);
    await setChainSubscriptionsState();
  }
};

export const handleShowDisclaimer = async (): Promise<boolean> => {
  const flag = (await DbController.get(
    'settings',
    'setting:show-disclaimer',
  )) as boolean;

  if (!flag) {
    await DbController.set('settings', 'setting:show-disclaimer', true);
  }
  return !flag;
};
