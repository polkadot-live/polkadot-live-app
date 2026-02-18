// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { getSharedState, isSystemsInitialized, setSharedState } from '../state';
import { sendChromeMessage } from '../utils';
import type { SyncID } from '@polkadot-live/types/communication';

export const initOnlineMode = async () => {
  // Util to send state messages.
  const sendMessages = async (isConnected: boolean, isOnline: boolean) => {
    await sendChromeMessage('sharedState', 'set', {
      key: 'mode:connected' as SyncID,
      value: isConnected,
    });
    await sendChromeMessage('sharedState', 'set', {
      key: 'mode:online' as SyncID,
      value: isOnline,
    });
  };

  if (isSystemsInitialized()) {
    const cache = getSharedState();
    const isConnected = navigator.onLine;
    const isOnline = isConnected ? Boolean(cache.get('mode:online')) : false;
    setSharedState('mode:connected', isConnected);
    setSharedState('mode:online', isOnline);
    await sendMessages(isConnected, isOnline);
  } else {
    const value = navigator.onLine;
    setSharedState('mode:connected', value);
    setSharedState('mode:online', value);
    await sendMessages(value, value);
  }
};

export const initTheme = async () => {
  const key = 'mode:dark';
  const stored = await DbController.get('settings', 'setting:dark-mode');
  const value = Boolean(stored);
  setSharedState(key, value);
  sendChromeMessage('sharedState', 'set', { key, value });
};
