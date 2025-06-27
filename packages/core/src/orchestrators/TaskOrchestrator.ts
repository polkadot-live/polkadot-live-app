// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getOnlineStatus } from '../library/CommonLib';
import type { QueryMultiWrapper } from '../model';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

/**
 * This class is used in the main window renderer.
 *
 * Task subscription flow in the TaskOrchestrator static class:
 *
 *  > subscribeTask(task, wrapper)
 *  > next(task, wrapper)
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

    if (isOnline) {
      await wrapper.build(task.chainId);
      await wrapper.run(task.chainId);
    }
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
      await wrapper.build(task.chainId);
    }

    // Build the tasks if the app is in online mode.
    const isOnline: boolean = await getOnlineStatus();
    if (isOnline) {
      const chainIds = new Set(tasks.map((t) => t.chainId));
      for (const chainId of chainIds) {
        await wrapper.run(chainId);
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
      case 'Polkadot Asset Hub':
      case 'Polkadot People':
      case 'Kusama':
      case 'Kusama Asset Hub':
      case 'Kusama People':
      case 'Westend':
      case 'Westend Asset Hub':
      case 'Westend People': {
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
}
