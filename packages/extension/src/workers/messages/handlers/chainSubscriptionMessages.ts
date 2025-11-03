// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getAllChainSubscriptions,
  setChainSubscriptionsState,
  subscribeChainTask,
  updateChainSubscription,
  updateChainSubscriptions,
} from '../../chainSubscriptions';
import type { AnyData } from '@polkadot-live/types/misc';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const handleChainSubscriptionMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'getAll': {
      getAllChainSubscriptions().then((result) => {
        sendResponse(JSON.stringify(Array.from(result.entries())));
      });
      return true;
    }
    case 'update': {
      const { task }: { task: SubscriptionTask } = message.payload;
      updateChainSubscription(task).then(() =>
        subscribeChainTask(task).then(() =>
          setChainSubscriptionsState().then(() => sendResponse(true))
        )
      );
      return true;
    }
    case 'updateMany': {
      const { tasks }: { tasks: SubscriptionTask[] } = message.payload;
      updateChainSubscriptions(tasks).then(() =>
        setChainSubscriptionsState().then(() => sendResponse(true))
      );
      return true;
    }
    default: {
      console.warn(`Unknown chain subscription task: ${message.task}`);
      return false;
    }
  }
};
