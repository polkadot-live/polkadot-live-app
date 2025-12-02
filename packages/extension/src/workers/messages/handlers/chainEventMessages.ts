// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getActiveCount,
  getAllChainEvents,
  getAllChainEventsForAccount,
  putChainEvent,
  putChainEventForAccount,
  removeAllChainEventsForAccount,
  removeChainEvent,
  removeChainEventForAccount,
  updateChainEvent,
} from '../../chainEvents';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';
import { ChainEventsService } from '@polkadot-live/core';

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
    case 'getAllForAccount': {
      const { account }: { account: FlattenedAccountData } = message.payload;
      getAllChainEventsForAccount(account).then((res) => sendResponse(res));
      return true;
    }
    case 'insert': {
      const { sub }: { sub: ChainEventSubscription } = message.payload;
      putChainEvent(sub);
      return false;
    }
    case 'insertForAccount': {
      const { account, subscription: sub } = message.payload;
      putChainEventForAccount(account, sub).then(() => {
        ChainEventsService.insertForAccount(account, sub);
        ChainEventsService.initEventStream(account.chain);
      });
      return false;
    }
    case 'remove': {
      const { sub }: { sub: ChainEventSubscription } = message.payload;
      removeChainEvent(sub);
      return false;
    }
    case 'removeForAccount': {
      const { account, subscription } = message.payload;
      removeChainEventForAccount(account, subscription).then(() => {
        ChainEventsService.removeForAccount(account, subscription);
        ChainEventsService.tryStopEventsStream(account.chain);
      });
      return false;
    }
    case 'removeAllForAccount': {
      const { account }: { account: FlattenedAccountData } = message.payload;
      removeAllChainEventsForAccount(account);
      return false;
    }
    case 'toggleNotifyForAccount': {
      const { account, subscription: sub } = message.payload;
      putChainEventForAccount(account, sub).then(() => {
        ChainEventsService.updateForAccount(account, sub);
      });
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
