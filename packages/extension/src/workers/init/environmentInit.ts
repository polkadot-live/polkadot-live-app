// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { sendChromeMessage } from '../utils';
import { setSharedState } from '../state';
import type { SyncID } from '@polkadot-live/types/communication';

export const initOnlineMode = async () => {
  const value = navigator.onLine;
  setSharedState('mode:connected', value);
  setSharedState('mode:online', value);

  await sendChromeMessage('sharedState', 'set', {
    key: 'mode:connected' as SyncID,
    value,
  });
  await sendChromeMessage('sharedState', 'set', {
    key: 'mode:online' as SyncID,
    value,
  });
};

export const initTheme = async () => {
  const key = 'mode:dark';
  const stored = await DbController.get('settings', 'setting:dark-mode');
  const value = Boolean(stored);
  setSharedState(key, value);
  sendChromeMessage('sharedState', 'set', { key, value });
};
