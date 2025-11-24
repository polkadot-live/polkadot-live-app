// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getActiveCount,
  getAllChainEvents,
  putChainEvent,
  removeChainEvent,
  updateChainEvent,
} from '../../chainEvents';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainEventSubscription } from '@polkadot-live/types';

export const handleChainEventMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'getActiveCount': {
      getActiveCount().then((res) => sendResponse(res));
      return true;
    }
    case 'getAll': {
      getAllChainEvents().then((res) => sendResponse(res));
      return true;
    }
    case 'insert': {
      const { sub }: { sub: ChainEventSubscription } = message.payload;
      putChainEvent(sub);
      return false;
    }
    case 'remove': {
      const { sub }: { sub: ChainEventSubscription } = message.payload;
      removeChainEvent(sub);
      return false;
    }
    case 'update': {
      const { sub }: { sub: ChainEventSubscription } = message.payload;
      updateChainEvent(sub);
      return false;
    }
    default: {
      console.warn(`Unknown chain event task: ${message.task}`);
      return false;
    }
  }
};
