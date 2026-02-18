// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '../controllers';
import { getOnlineStatus } from '../library/CommonLib';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';
import type { QueryMultiWrapper } from '../model';

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
   * @name buildTasks
   * @summary Inserts subscription tasks and builds the query multi argument.
   */
  static async buildTasks(
    tasks: SubscriptionTask[],
    wrapper: QueryMultiWrapper,
  ) {
    if (tasks.length === 0) {
      return;
    }
    // Insert task in owner account's query multi wrapper.
    for (const task of tasks) {
      TaskOrchestrator.next(task, wrapper);
    }
    // Build query multi API argument.
    await wrapper.build(tasks[0].chainId);
  }

  /**
   * @name subscribeTask
   * @summary Cache the task in its respective wrapper and build (subscribe) if app is online.
   */
  static async subscribeTask(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper,
  ) {
    const backend = APIsController.backend;
    const { chainId } = task;

    const isOnline: boolean = await getOnlineStatus(backend);
    const isRunnable = !APIsController.getFailedChainIds().includes(chainId);
    TaskOrchestrator.next(task, wrapper);

    await wrapper.build(task.chainId);
    if (isOnline) {
      isRunnable && (await wrapper.run(chainId));
    }
  }

  /**
   * @name subscribeTasks
   * @summary Same as `subscribeTask` but for an array of subscription tasks.
   */
  static async subscribeTasks(
    tasks: SubscriptionTask[],
    wrapper: QueryMultiWrapper,
  ) {
    // Return early if no tasks received.
    if (tasks.length === 0) {
      return;
    }
    // Insert task in owner account's query multi wrapper.
    for (const task of tasks) {
      TaskOrchestrator.next(task, wrapper);
    }
    // Build query multi API argument.
    await wrapper.build(tasks[0].chainId);

    // Run the tasks if the app is in online mode.
    const isOnline: boolean = await getOnlineStatus(APIsController.backend);
    if (!isOnline) {
      return;
    }
    const disconnected = APIsController.getFailedChainIds();
    const chainIds = new Set(
      [...new Set(tasks.map(({ chainId }) => chainId))].map((chainId) => ({
        chainId,
        isRunnable: !disconnected.includes(chainId),
      })),
    );
    for (const { chainId, isRunnable } of chainIds) {
      isRunnable && (await wrapper.run(chainId));
    }
  }

  /**
   * @name next
   * @summary Check for sufficient data and handle the subscription task.
   */
  private static next(task: SubscriptionTask, wrapper: QueryMultiWrapper) {
    switch (task.chainId) {
      // Identify chain ID
      case 'Polkadot Relay':
      case 'Polkadot Asset Hub':
      case 'Polkadot People':
      case 'Kusama Relay':
      case 'Kusama Asset Hub':
      case 'Kusama People':
      case 'Paseo Relay':
      case 'Paseo Asset Hub':
      case 'Paseo People':
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
        TaskOrchestrator.handleTask(task, wrapper);
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
    wrapper: QueryMultiWrapper,
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
