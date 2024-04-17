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
          case 'subscribe:chain:timestamp': {
            await TaskOrchestrator.subscribe_query_timestamp_now(task, wrapper);
            break;
          }

          case 'subscribe:chain:currentSlot': {
            await TaskOrchestrator.subscribe_query_babe_currentSlot(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:account:balance': {
            await TaskOrchestrator.subscribe_query_system_account(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:account:nominationPools:rewards': {
            await TaskOrchestrator.subscribe_nomination_pool_rewards(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:account:nominationPools:state': {
            await TaskOrchestrator.subscribe_nomination_pool_state(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:account:nominationPools:renamed': {
            await TaskOrchestrator.subscribe_nomination_pool_renamed(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:account:nominationPools:roles': {
            await TaskOrchestrator.subscribe_nomination_pool_roles(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:account:nominationPools:commission': {
            await TaskOrchestrator.subscribe_nomination_pool_commission(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:account:nominating:pendingPayouts': {
            await TaskOrchestrator.subscribe_nominating_pending_payouts(
              task,
              wrapper
            );
            break;
          }

          case 'subscribe:account:nominating:exposure': {
            await TaskOrchestrator.subscribe_nominating_exposure(task, wrapper);
            break;
          }

          case 'subscribe:account:nominating:commission': {
            await TaskOrchestrator.subscribe_nominating_commission(
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
      case 'subscribe:chain:timestamp':
        return instance.api.query.timestamp.now;
      case 'subscribe:chain:currentSlot':
        return instance.api.query.babe.currentSlot;
      case 'subscribe:account:balance':
        return instance.api.query.system.account;
      case 'subscribe:account:nominationPools:rewards':
        return instance.api.query.system.account;
      case 'subscribe:account:nominationPools:state':
        return instance.api.query.nominationPools.bondedPools;
      case 'subscribe:account:nominationPools:renamed':
        return instance.api.query.nominationPools.metadata;
      case 'subscribe:account:nominationPools:roles':
        return instance.api.query.nominationPools.bondedPools;
      case 'subscribe:account:nominationPools:commission':
        return instance.api.query.nominationPools.bondedPools;
      case 'subscribe:account:nominating:pendingPayouts':
        return instance.api.query.staking.activeEra;
      case 'subscribe:account:nominating:exposure':
        return instance.api.query.staking.activeEra;
      case 'subscribe:account:nominating:commission':
        return instance.api.query.staking.activeEra;
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
   * @name subscribe_nomination_pool_rewards
   * @summary Handle a task that subscribes to the API function api.query.system.account for a nomination pool's reward address.
   */
  private static async subscribe_nomination_pool_rewards(
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

  /**
   * @name subscribe_nomination_pool_state
   * @summary Handle a task that subscribes to the API function api.query.nominationPools.bondedPools to fetch a pool's state.
   */
  private static async subscribe_nomination_pool_state(
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

  /**
   * @name subscribe_nomination_pool_renamed
   * @summary Handle a task that subscribes to the API function api.query.nominationPools.metadata to fetch a pool's name.
   */
  private static async subscribe_nomination_pool_renamed(
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

  /**
   * @name subscribe_nomination_pool_roles
   * @summary Handle a task that subscribes to the API function api.query.nominationPools.bondedPools to fetch a pool's roles.
   */
  private static async subscribe_nomination_pool_roles(
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

  /**
   * @name subscribe_nomination_pool_commission
   * @summary Handle a task that subscribes to the API function api.query.nominationPools.bondedPools to fetch a pool's commission.
   */
  private static async subscribe_nomination_pool_commission(
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

  /**
   * @name subscribe_nominating_pending_payouts
   * @summary Handle a task that subscribes to the API function api.query.activeEra and notifies an account's pending payouts.
   */
  private static async subscribe_nominating_pending_payouts(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    try {
      // Exit early if the account in question is not nominating.
      if (!task.account?.nominatingData) {
        console.log('🟠 Account is not nominating.');
        return;
      }

      // Otherwise rebuild query.
      await TaskOrchestrator.handleTask(task, wrapper);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @name subscribe_nominating_exposure
   * @summary Handle a task that subscribes to the API function api.query.activeEra and notifies an account's exposure.
   */
  private static async subscribe_nominating_exposure(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    try {
      // Exit early if the account in question is not nominating.
      if (!task.account?.nominatingData) {
        console.log('🟠 Account is not nominating.');
        return;
      }

      // Otherwise rebuild query.
      await TaskOrchestrator.handleTask(task, wrapper);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @name subscribe_nominating_commission
   * @summary Handle a task that subscribes to the API function api.query.activeEra and handles nominated validator commission changes.
   */
  private static async subscribe_nominating_commission(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    try {
      // Exit early if the account in question is not nominating.
      if (!task.account?.nominatingData) {
        console.log('🟠 Account is not nominating.');
        return;
      }

      // Otherwise rebuild query.
      await TaskOrchestrator.handleTask(task, wrapper);
    } catch (err) {
      console.error(err);
    }
  }
}
