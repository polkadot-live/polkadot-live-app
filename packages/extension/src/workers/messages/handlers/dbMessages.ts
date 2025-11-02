// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../../controllers';
import type { AnyData } from '@polkadot-live/types/misc';
import type { SettingKey } from '@polkadot-live/types/settings';
import type { Stores } from '../../../controllers';

export const handleDbMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'settings:get': {
      const { store, key }: { store: Stores; key: string } = message;
      DbController.get(store, key).then(sendResponse);
      return true;
    }
    case 'settings:getAll': {
      DbController.getAll('settings').then((result) => {
        sendResponse(result);
      });
      return true;
    }
    case 'settings:set': {
      const { key, value }: { key: SettingKey; value: boolean } = message;
      DbController.set('settings', key, value);
      return false;
    }
    default: {
      console.warn(`Unknown DB task: ${message.task}`);
      return false;
    }
  }
};
