// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { executeIntervaledOneShot, executeOneShot } from '@polkadot-live/core';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  IntervalSubscription,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';

export const handleOneShotMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'execute': {
      const { task }: { task: SubscriptionTask } = message.payload;
      executeOneShot(task).then((success) => sendResponse(success));
      return true;
    }
    case 'executeInterval': {
      const { task }: { task: IntervalSubscription } = message.payload;
      executeIntervaledOneShot(task, 'one-shot').then((result) =>
        sendResponse(result)
      );
      return true;
    }
    default: {
      console.warn(`Unknown one shot task: ${message.task}`);
      return false;
    }
  }
};
