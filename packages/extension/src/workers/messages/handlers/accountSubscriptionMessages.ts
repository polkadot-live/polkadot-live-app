// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@polkadot-live/core';
import {
  onNotificationToggle,
  setAccountSubscriptionsState,
  subscribeAccountTask,
  updateAccountSubscription,
  updateAccountSubscriptions,
} from '../../subscriptions';
import type { AnyData } from '@polkadot-live/types/misc';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const handleAccountSubscriptionMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void,
): boolean => {
  switch (message.task) {
    case 'update': {
      const { task }: { task: SubscriptionTask } = message.payload;
      const { chainId, account: flattened } = task;
      const account = AccountsController.get(chainId, flattened?.address);
      if (!account) {
        sendResponse(false);
      } else {
        updateAccountSubscription(account, task).then(() =>
          subscribeAccountTask(task).then(() =>
            setAccountSubscriptionsState().then(() => sendResponse(true)),
          ),
        );
      }
      return true;
    }
    case 'updateMany': {
      const { tasks }: { tasks: SubscriptionTask[] } = message.payload;
      updateAccountSubscriptions(tasks).then(() =>
        setAccountSubscriptionsState().then(() => sendResponse(true)),
      );
      return true;
    }
    case 'notificationToggle': {
      const { task }: { task: SubscriptionTask } = message.payload;
      onNotificationToggle(task).then(() => sendResponse(true));
      return true;
    }
    default: {
      console.warn(`Unknown account subscription task: ${message.task}`);
      return false;
    }
  }
};
