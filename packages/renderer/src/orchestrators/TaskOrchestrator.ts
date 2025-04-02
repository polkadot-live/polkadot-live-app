// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getOnlineStatus } from '@ren/utils/CommonUtils';
import { MainDebug } from '@ren/utils/DebugUtils';
import { APIsController } from '@ren/controller/APIsController';
import type { QueryMultiWrapper } from '@ren/model/QueryMultiWrapper';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

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
   * @summary Calls the appropriate subscription function based on the task's chain ID and action string.
   */
  private static next(task: SubscriptionTask, wrapper: QueryMultiWrapper) {
    switch (task.chainId) {
      // Identify chain ID
      case 'Polkadot':
      case 'Westend':
      case 'Kusama': {
        // Identify task
        switch (task.action) {
          case 'subscribe:chain:timestamp': {
            TaskOrchestrator.subscribe_query_timestamp_now(task, wrapper);
            break;
          }
          case 'subscribe:chain:currentSlot': {
            TaskOrchestrator.subscribe_query_babe_currentSlot(task, wrapper);
            break;
          }
          case 'subscribe:account:balance:free': {
            TaskOrchestrator.subscribe_account_balance_free(task, wrapper);
            break;
          }
          case 'subscribe:account:balance:frozen': {
            TaskOrchestrator.subscribe_account_balance_frozen(task, wrapper);
            break;
          }
          case 'subscribe:account:balance:reserved': {
            TaskOrchestrator.subscribe_account_balance_reserved(task, wrapper);
            break;
          }
          case 'subscribe:account:balance:spendable': {
            TaskOrchestrator.subscribe_account_balance_spendable(task, wrapper);
            break;
          }
          case 'subscribe:account:nominationPools:rewards': {
            TaskOrchestrator.subscribe_nomination_pool_rewards(task, wrapper);
            break;
          }
          case 'subscribe:account:nominationPools:state': {
            TaskOrchestrator.subscribe_nomination_pool_state(task, wrapper);
            break;
          }
          case 'subscribe:account:nominationPools:renamed': {
            TaskOrchestrator.subscribe_nomination_pool_renamed(task, wrapper);
            break;
          }
          case 'subscribe:account:nominationPools:roles': {
            TaskOrchestrator.subscribe_nomination_pool_roles(task, wrapper);
            break;
          }
          case 'subscribe:account:nominationPools:commission': {
            TaskOrchestrator.subscribe_nomination_pool_commission(
              task,
              wrapper
            );
            break;
          }
          case 'subscribe:account:nominating:pendingPayouts': {
            TaskOrchestrator.subscribe_nominating_pending_payouts(
              task,
              wrapper
            );
            break;
          }
          case 'subscribe:account:nominating:exposure': {
            TaskOrchestrator.subscribe_nominating_exposure(task, wrapper);
            break;
          }
          case 'subscribe:account:nominating:commission': {
            TaskOrchestrator.subscribe_nominating_commission(task, wrapper);
            break;
          }
          case 'subscribe:account:nominating:nominations': {
            TaskOrchestrator.subscribe_nominating_nominations(task, wrapper);
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

  /*-------------------------------------------------- 
   Subscription Handlers
   --------------------------------------------------*/

  /**
   * @name subscribe_query_timestamp_now
   * @summary Handle a task that subscribes to the API function api.query.timestamp.now.
   */
  private static subscribe_query_timestamp_now(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_query_babe_currentSlot
   * @summary Handle a task that subscribes to the API function api.query.babe.currentSlot.
   */
  private static subscribe_query_babe_currentSlot(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_account_balance_free
   * @summary Handle a task that subscribes to the API function api.query.system.account.
   */
  private static subscribe_account_balance_free(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_account_balance_frozen
   * @summary Subscribe to api.query.system.account to fetch an account's frozen balance.
   */
  private static subscribe_account_balance_frozen(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_account_balance_reserved
   * @summary Subscribe to api.query.system.account to fetch an account's reserved balance.
   */
  private static subscribe_account_balance_reserved(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_account_balance_spendable
   * @summary Subscribe to api.query.system.account to fetch an account's spendable balance.
   */
  private static subscribe_account_balance_spendable(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_nomination_pool_rewards
   * @summary Handle a task that subscribes to the API function api.query.system.account for a nomination pool's reward address.
   */
  private static subscribe_nomination_pool_rewards(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Exit early if the associated account has not joined a nomination pool.
    if (!task.account?.nominationPoolData) {
      debug('🟠 Account has not joined a nomination pool.');
      return;
    }

    // Otherwise rebuild query.
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_nomination_pool_state
   * @summary Handle a task that subscribes to the API function api.query.nominationPools.bondedPools to fetch a pool's state.
   */
  private static subscribe_nomination_pool_state(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Exit early if the account in question has not joined a nomination pool.
    if (!task.account?.nominationPoolData) {
      debug('🟠 Account has not joined a nomination pool.');
      return;
    }

    // Otherwise rebuild query.
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_nomination_pool_renamed
   * @summary Handle a task that subscribes to the API function api.query.nominationPools.metadata to fetch a pool's name.
   */
  private static subscribe_nomination_pool_renamed(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Exit early if the account in question has not joined a nomination pool.
    if (!task.account?.nominationPoolData) {
      debug('🟠 Account has not joined a nomination pool.');
      return;
    }

    // Otherwise rebuild query.
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_nomination_pool_roles
   * @summary Handle a task that subscribes to the API function api.query.nominationPools.bondedPools to fetch a pool's roles.
   */
  private static subscribe_nomination_pool_roles(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Exit early if the account in question has not joined a nomination pool.
    if (!task.account?.nominationPoolData) {
      debug('🟠 Account has not joined a nomination pool.');
      return;
    }

    // Otherwise rebuild query.
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_nomination_pool_commission
   * @summary Handle a task that subscribes to the API function api.query.nominationPools.bondedPools to fetch a pool's commission.
   */
  private static subscribe_nomination_pool_commission(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Exit early if the account in question has not joined a nomination pool.
    if (!task.account?.nominationPoolData) {
      debug('🟠 Account has not joined a nomination pool.');
      return;
    }

    // Otherwise rebuild query.
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_nominating_pending_payouts
   * @summary Handle a task that subscribes to the API function api.query.activeEra and notifies an account's pending payouts.
   */
  private static subscribe_nominating_pending_payouts(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Exit early if the account in question is not nominating.
    if (!task.account?.nominatingData) {
      console.log('🟠 Account is not nominating.');
      return;
    }

    // Otherwise rebuild query.
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_nominating_exposure
   * @summary Handle a task that subscribes to the API function api.query.activeEra and notifies an account's exposure.
   */
  private static subscribe_nominating_exposure(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Exit early if the account in question is not nominating.
    if (!task.account?.nominatingData) {
      console.log('🟠 Account is not nominating.');
      return;
    }

    // Otherwise rebuild query.
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_nominating_commission
   * @summary Handle a task that subscribes to the API function api.query.activeEra and handles nominated validator commission changes.
   */
  private static subscribe_nominating_commission(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Exit early if the account in question is not nominating.
    if (!task.account?.nominatingData) {
      console.log('🟠 Account is not nominating.');
      return;
    }

    // Otherwise rebuild query.
    TaskOrchestrator.handleTask(task, wrapper);
  }

  /**
   * @name subscribe_nominating_nominations
   * @summary Handle a task that subscribes to the API function api.query.activeEra and handles changes in nominated validators.
   */
  private static subscribe_nominating_nominations(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    // Exit early if the account in question is not nominating.
    if (!task.account?.nominatingData) {
      console.log('🟠 Account is not nominating.');
      return;
    }

    // Otherwise rebuild query.
    TaskOrchestrator.handleTask(task, wrapper);
  }
}
