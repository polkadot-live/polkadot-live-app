// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getOnlineStatus } from '@ren/utils/CommonUtils';
import { APIsController } from '@ren/controller/APIsController';
import type { QueryMultiWrapper } from '@ren/model/QueryMultiWrapper';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

/**
 * This class is used in the main window renderer.
 *
 * Task subscription flow in the TaskOrchestrator static class:
 *
 *  > subscribeTask(task, wrapper)
 *  |
 *  > next(task, wrapper)
 *  |
 *  > handleTask(task, apiCall, wrapper)
 */

// Orchestrator class to receive and handle subscription tasks.
export class TaskOrchestrator {
  /**
   * @name subscribeTask
   * @summary Cache the task in its respective wrapper and build (subscribe) if app is online.
   */
  static async subscribeTask(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    const isOnline: boolean = await getOnlineStatus();
    this.next(task, wrapper);
    isOnline && (await wrapper.build(task.chainId));
  }

  /**
   * @name subscribeTasks
   * @summary Same as `subscribeTask` but for an array of subscription tasks.
   */
  static async subscribeTasks(
    tasks: SubscriptionTask[],
    wrapper: QueryMultiWrapper
  ) {
    // Return early if no tasks received.
    if (tasks.length === 0) {
      return;
    }

    // Cache task in its owner account's query multi wrapper.
    for (const task of tasks) {
      this.next(task, wrapper);
    }

    // Build the tasks if the app is in online mode.
    const isOnline: boolean = await getOnlineStatus();
    if (isOnline) {
      const chainIds = new Set(tasks.map((t) => t.chainId));
      for (const chainId of chainIds) {
        isOnline && (await wrapper.build(chainId));
      }
    }
  }

  /**
   * @name next
   * @summary Check for sufficient data and handle the subscription task.
   */
  private static next(task: SubscriptionTask, wrapper: QueryMultiWrapper) {
    switch (task.chainId) {
      // Identify chain ID
      case 'Polkadot':
      case 'Westend':
      case 'Kusama': {
        // Return if data is missing for certain tasks.
        switch (task.action) {
          case 'subscribe:account:nominationPools:rewards':
          case 'subscribe:account:nominationPools:state':
          case 'subscribe:account:nominationPools:renamed':
          case 'subscribe:account:nominationPools:roles':
          case 'subscribe:account:nominationPools:commission': {
            if (!task.account?.nominationPoolData) {
              console.log('🟠 Account has not joined a nomination pool.');
              return;
            }
            break;
          }
          case 'subscribe:account:nominating:pendingPayouts':
          case 'subscribe:account:nominating:exposure':
          case 'subscribe:account:nominating:commission':
          case 'subscribe:account:nominating:nominations': {
            if (!task.account?.nominatingData) {
              console.log('🟠 Account is not nominating.');
              return;
            }
            break;
          }
          default: {
            break;
          }
        }

        // Rebuild query.
        this.handleTask(task, wrapper);
        break;
      }
    }
  }

  /**
   * @name handleTask
   * @summary Handle augmenting or removing a task from a query multi wrapper.
   */
  private static handleTask(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    switch (task.status) {
      // Add this action to the chain's subscriptions.
      case 'enable': {
        wrapper.insert(task);
        break;
      }
      // Remove this action from the chain's subscriptions.
      case 'disable': {
        wrapper.remove(task.chainId, task.action);
        break;
      }
    }
  }

  /*-------------------------------------------------- 
   API function call factory
   --------------------------------------------------*/

  // TODO: Get API instance from API context, wherever this execution flow starts.
  // Tweak the logic to accept either a `null` or `Api` instance. If `null` is
  // provided, we can assume we are in offline mode.

  static async getApiCall(task: SubscriptionTask) {
    const { action, chainId } = task;
    const { api } = await APIsController.getConnectedApiOrThrow(chainId);

    switch (action) {
      case 'subscribe:chain:timestamp':
        return api.query.timestamp.now;
      case 'subscribe:chain:currentSlot':
        return api.query.babe.currentSlot;
      case 'subscribe:account:balance:free':
        return api.query.system.account;
      case 'subscribe:account:balance:frozen':
        return api.query.system.account;
      case 'subscribe:account:balance:reserved':
        return api.query.system.account;
      case 'subscribe:account:balance:spendable':
        return api.query.system.account;
      case 'subscribe:account:nominationPools:rewards':
        return api.query.system.account;
      case 'subscribe:account:nominationPools:state':
        return api.query.nominationPools.bondedPools;
      case 'subscribe:account:nominationPools:renamed':
        return api.query.nominationPools.metadata;
      case 'subscribe:account:nominationPools:roles':
        return api.query.nominationPools.bondedPools;
      case 'subscribe:account:nominationPools:commission':
        return api.query.nominationPools.bondedPools;
      case 'subscribe:account:nominating:pendingPayouts':
        return api.query.staking.activeEra;
      case 'subscribe:account:nominating:exposure':
        return api.query.staking.activeEra;
      case 'subscribe:account:nominating:commission':
        return api.query.staking.activeEra;
      case 'subscribe:account:nominating:nominations':
        return api.query.staking.activeEra;
      default:
        throw new Error('Subscription action not found');
    }
  }
}
