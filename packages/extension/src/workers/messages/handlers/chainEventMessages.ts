// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getActiveCount,
  getActiveRefIds,
  getAllChainEvents,
  getAllChainEventsForAccount,
  getAllRefSubs,
  getAllRefSubsForChain,
  putChainEvent,
  putChainEventForAccount,
  putChainEventsForRef,
  removeAllChainEventsForAccount,
  removeChainEvent,
  removeChainEventForAccount,
  updateChainEvent,
} from '../../chainEvents';
import { ChainEventsService } from '@polkadot-live/core';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export const handleChainEventMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'getActiveCount': {
      getActiveCount().then((res) => sendResponse(res));
      return true;
    }
    case 'getActiveRefIds': {
      getActiveRefIds().then((ids) => sendResponse(ids));
      return true;
    }
    case 'getAll': {
      getAllChainEvents().then((res) => sendResponse(res));
      return true;
    }
    case 'getAllRefSubs': {
      getAllRefSubs().then((res) => sendResponse(res));
      return true;
    }
    case 'getAllRefSubsForChain': {
      const { chainId }: { chainId: ChainID } = message.payload;
      getAllRefSubsForChain(chainId).then((res) => sendResponse(res));
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
    case 'insertRefSubs': {
      const { chainId, refId, subscriptions } = message.payload;
      const subs = subscriptions as ChainEventSubscription[];
      putChainEventsForRef(subs).then(() => {
        subs.forEach((s) => ChainEventsService.insertRefScoped(refId, s));
        ChainEventsService.initEventStream(chainId);
      });
      return false;
    }
    case 'putRefSub': {
      const { refId, subscription } = message.payload;
      const sub = subscription as ChainEventSubscription;
      putChainEventsForRef([sub]).then(() => {
        ChainEventsService.updateRefScoped(refId, sub);
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
