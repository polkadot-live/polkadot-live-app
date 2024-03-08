// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MainDebug } from '@/utils/DebugUtils';
import type { QueryMultiWrapper } from '@/model/QueryMultiWrapper';
import type { SubscriptionTask } from '@/types/subscriptions';
import * as ApiUtils from '@/utils/ApiUtils';

const debug = MainDebug.extend('TaskOrchestrator');

/**
 * This class is used in the main window renderer.
 *
 * Task subscription flow in the TaskOrchestrator static class:
 *
 *  > subscribeTask(task, wrapper)
 *  |
 *  > next(task, wrapper)
 *  |
 *  > subscribe_<function>(task, wrapper)
 *  |
 *  > handleTask(task, apiCall, wrapper)
 */

// Orchestrator class to receive and handle subscription tasks.
export class TaskOrchestrator {
  /**
   * @name subscribeTask
   * @summary Public wrapper around calling subject's next method.
   */
  static async subscribeTask(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    await this.next(task, wrapper);
  }

  /**
   * @name next
   * @summary Calls the appropriate subscription function based on the task's chain ID and action string.
   */
  private static async next(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    switch (task.chainId) {
      // Identify chain ID
      case 'Polkadot':
      case 'Westend':
      case 'Kusama': {
        // Identify task
        switch (task.action) {
          case 'subscribe:query.timestamp.now': {
            debug('🟢 subscribe:query.timestamp.now');
            await TaskOrchestrator.subscribe_query_timestamp_now(task, wrapper);
            break;
          }

          case 'subscribe:query.babe.currentSlot': {
            debug('🟢 subscribe:query.babe.currentSlot');
            await TaskOrchestrator.subscribe_query_babe_currentSlot(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:query.system.account': {
            debug('🟢 subscribe:query.system.account (account)');
            await TaskOrchestrator.subscribe_query_system_account(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:nominationPools:query.system.account': {
            debug(
              '🟢 subscribe:nominationPools:query.system.account (rewards)'
            );
            await TaskOrchestrator.subscribe_nomination_pool_reward_account(
              task,
              wrapper
            );
            break;
          }

          default: {
            throw new Error('Subscription action not found');
          }
        }
      }
    }
  }

  /**
   * @name handleTask
   * @summary Handle augmenting or removing a task from a query multi wrapper.
   */
  private static async handleTask(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Build tasks if app is online, otherwise just cache them.
    const isOnline = await window.myAPI.getOnlineStatus();

    switch (task.status) {
      // Add this action to the chain's subscriptions.
      case 'enable': {
        wrapper.insert(task);
        isOnline && (await wrapper.build(task.chainId));
        break;
      }
      // Remove this action from the chain's subscriptions.
      case 'disable': {
        wrapper.remove(task.chainId, task.action);
        isOnline && (await wrapper.build(task.chainId));
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
    const instance = await ApiUtils.getApiInstance(chainId);

    switch (action) {
      case 'subscribe:query.timestamp.now':
        return instance.api.query.timestamp.now;
      case 'subscribe:query.babe.currentSlot':
        return instance.api.query.babe.currentSlot;
      case 'subscribe:query.system.account':
        return instance.api.query.system.account;
      case 'subscribe:nominationPools:query.system.account':
        return instance.api.query.system.account;
      default:
        throw new Error('Subscription action not found');
    }
  }

  /*-------------------------------------------------- 
   Subscription Handlers
   --------------------------------------------------*/

  /**
   * @name subscribe_query_timestamp_now
   * @summary Handle a task that subscribes to the API function api.query.timestamp.now.
   */
  private static async subscribe_query_timestamp_now(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    try {
      await TaskOrchestrator.handleTask(task, wrapper);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @name subscribe_query_babe_currentSlot
   * @summary Handle a task that subscribes to the API function api.query.babe.currentSlot.
   */
  private static async subscribe_query_babe_currentSlot(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    try {
      await TaskOrchestrator.handleTask(task, wrapper);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @name subscribe_query_system_account
   * @summary Handle a task that subscribes to the API function api.query.system.account.
   */
  private static async subscribe_query_system_account(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    try {
      await TaskOrchestrator.handleTask(task, wrapper);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @name subscribe_nomination_pool_reward_account
   * @summary Handle a task that subscribes to the API function api.query.system.account for a nomination pool's reward address.
   */
  private static async subscribe_nomination_pool_reward_account(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    try {
      // Exit early if the account in question has not joined a nomination pool.
      if (!task.account?.nominationPoolData) {
        debug('🟠 Account has not joined a nomination pool.');
        return;
      }

      // Otherwise rebuild query.
      await TaskOrchestrator.handleTask(task, wrapper);
    } catch (err) {
      console.error(err);
    }
  }
}
