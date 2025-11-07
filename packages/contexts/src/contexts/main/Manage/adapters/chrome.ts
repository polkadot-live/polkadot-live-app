// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types';
import type { ManageAdapter } from './types';

export const chromeAdapter: ManageAdapter = {
  onMount: (setRenderedSubscriptions) => {
    const callback = (message: AnyData) => {
      if (message.type === 'subscriptions') {
        switch (message.task) {
          case 'clearRenderedSubscriptions': {
            setRenderedSubscriptions({ type: '', tasks: [] });
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },
};
