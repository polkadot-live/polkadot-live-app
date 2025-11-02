// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { removeEvent } from '../../events';
import type { AnyData } from '@polkadot-live/types/misc';
import type { EventCallback } from '@polkadot-live/types/reporter';

export const handleEventMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'remove': {
      const { event }: { event: EventCallback } = message.payload;
      removeEvent(event).then(() => sendResponse(true));
      return true;
    }
    default: {
      console.warn(`Unknown event task: ${message.task}`);
      return false;
    }
  }
};
