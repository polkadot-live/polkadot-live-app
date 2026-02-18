// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSharedState } from '../../state';
import { sendChromeMessage } from '../../utils';
import type { AnyData } from '@polkadot-live/types/misc';

export const handleSharedStateMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void,
): boolean => {
  switch (message.task) {
    case 'get': {
      sendResponse(JSON.stringify(Array.from(getSharedState().entries())));
      return true;
    }
    case 'relay': {
      const { payload } = message;
      sendChromeMessage('sharedState', 'set', payload);
      return false;
    }
    default: {
      console.warn(`Unknown shared state task: ${message.task}`);
      return false;
    }
  }
};
