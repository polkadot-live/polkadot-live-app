// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { clearAll, getCounts, getEvents, removeEvent } from '../../events';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  EventCallback,
  EventCategory,
  EventFetchPayload,
} from '@polkadot-live/types/reporter';

export const handleEventMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void,
): boolean => {
  switch (message.task) {
    case 'clearAll': {
      const { category }: { category: EventCategory } = message.payload;
      clearAll(category).then((res) => sendResponse(res));
      return true;
    }
    case 'getCounts': {
      getCounts().then((res) => sendResponse(res));
      return true;
    }
    case 'getEvents': {
      const { payload }: { payload: EventFetchPayload } = message.payload;
      getEvents(payload).then((res) => sendResponse(res));
      return true;
    }
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
