// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { handleDebuggingSubscriptions } from '../../settings';
import type { AnyData } from '@polkadot-live/types/misc';
import type { SettingItem } from '@polkadot-live/types/settings';

export const handleSettingMessage = (message: AnyData): boolean => {
  switch (message.task) {
    case 'handleSetting': {
      const { setting }: { setting: SettingItem } = message.payload;
      if (setting.key === 'setting:show-debugging-subscriptions') {
        handleDebuggingSubscriptions(setting);
        return false;
      }
      return false;
    }
    default: {
      console.warn(`Unknown setting task: ${message.task}`);
      return false;
    }
  }
};
