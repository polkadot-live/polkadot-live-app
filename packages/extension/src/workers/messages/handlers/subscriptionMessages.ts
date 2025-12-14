// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController, ChainEventsService } from '@polkadot-live/core';
import { DbController } from '../../../controllers';
import {
  handleAddIntervalSubscriptions,
  removeAllSubscriptions,
} from '../../intervals';
import { removeAllSubsForRef } from '../../chainEvents';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

interface I {
  chainId: ChainID;
  refId: number;
  tasks: IntervalSubscription[];
}

export const handleSubscriptionMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'addReferendumSubscriptions': {
      const { chainId, refId, tasks }: I = message.payload;
      addReferendumSubscriptions(chainId, refId, tasks);
      return false;
    }
    case 'removeReferendumSubscriptions': {
      const { chainId, refId }: I = message.payload;
      removeReferendumSubscriptions(chainId, refId);
      return false;
    }
    case 'chainHasSubscriptions': {
      const { chainId }: { chainId: ChainID } = message.payload;
      const accounts = AccountsController.accounts.get(chainId) || [];

      let result = false;
      for (const account of accounts) {
        const tasks = account.getSubscriptionTasks();
        if (tasks && tasks.length > 0) {
          result = true;
          break;
        }
      }
      sendResponse(result);
      return true;
    }
    default: {
      console.warn(`Unknown subscription task: ${message.task}`);
      return false;
    }
  }
};

/**
 * Called when an active referendum is added to the popup window.
 */
const addReferendumSubscriptions = async (
  chainId: ChainID,
  refId: number,
  tasks: IntervalSubscription[]
) => {
  // Cache refId.
  type T = string[] | undefined;
  const key = `${chainId}::${refId}`;
  const existing = (await DbController.get('activeRefIds', 'all')) as T;
  const next = [...(existing ?? []).filter((k) => k !== key), key];
  await DbController.set('activeRefIds', 'all', next);

  // Handle interval subscriptions.
  await handleAddIntervalSubscriptions(tasks, navigator.onLine);
};

/**
 * Called when an active referendum is removed via the popup or OpenGov window.
 */
const removeReferendumSubscriptions = async (
  chainId: ChainID,
  refId: number
) => {
  // Remove cached refId.
  type T = string[] | undefined;
  const key = `${chainId}::${refId}`;
  const existing = (await DbController.get('activeRefIds', 'all')) as T;
  const next = (existing ?? []).filter((k) => k !== key);
  await DbController.set('activeRefIds', 'all', next);

  // Remove chain event subscriptions.
  ChainEventsService.removeAllRefScoped(chainId, refId);
  await removeAllSubsForRef(chainId, refId);

  // Handle interval subscriptions.
  await removeAllSubscriptions(chainId, refId);
};
