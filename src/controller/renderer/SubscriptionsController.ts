// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { accountTasks as allAccountTasks } from '@/config/subscriptions/account';
import { chainTasks as allChainTasks } from '@/config/subscriptions/chain';
import { QueryMultiWrapper } from '@/model/QueryMultiWrapper';
import { TaskOrchestrator } from '@/orchestrators/TaskOrchestrator';
import type { Account, ImportedAccounts } from '@/model/Account';
import type { ChainID } from '@/types/chains';
import type { SubscriptionTask } from '@/types/subscriptions';

/**
 * Key naming convention of subscription tasks in store:
 *
 * 'chain_subscriptions'
 *   Key that stores global chain subscription tasks.
 *
 * '<account_address>_subscriptions'
 *   Key that stores an account's subscription tasks.
 *
 * Ex: const serialized = store.get('chain_subscriptions');
 *
 * When subscription tasks are retrieved and deserialised,
 * they can be passed to the `TaskOrchestrator`, where the API
 * call will be re-built.
 */

export class SubscriptionsController {
  static chainSubscriptions: QueryMultiWrapper | null = null;

  static addGlobal(wrapper: QueryMultiWrapper) {
    SubscriptionsController.chainSubscriptions = wrapper;
  }

  /**
   * @name initChainSubscriptions
   * @summary Fetch persisted chain subscription tasks from store and re-subscribe to them.
   */
  static async initChainSubscriptions() {
    // Instantiate QueryMultiWrapper.
    this.chainSubscriptions = new QueryMultiWrapper();

    // Send IPC message to get chain tasks from store.
    const serialized = await window.myAPI.getChainSubscriptions();

    // Deserialize fetched chain tasks.
    const tasks: SubscriptionTask[] =
      serialized !== '' ? JSON.parse(serialized) : [];

    // Subscribe to tasks.
    for (const task of tasks) {
      await TaskOrchestrator.subscribeTask(task, this.chainSubscriptions);
    }
  }

  /**
   * @name unsubscribeChains
   * @summary Calls `unsub` for each chain's queryMulti entry, but keeps the
   * subscription data. This method is called when the app goes into offline mode.
   */
  static unsubscribeChains() {
    this.chainSubscriptions?.unsubOnly();
  }

  /**
   * @name resubscribeChains
   * @summary Recalls the `queryMulti` api and subscribes to the wrapper's cached
   * subscription tasks. This method is called when the app goes into online mode.
   */
  static async resubscribeAccounts() {
    if (!this.chainSubscriptions) {
      return;
    }

    for (const task of this.chainSubscriptions?.getSubscriptionTasks() || []) {
      await TaskOrchestrator.subscribeTask(task, this.chainSubscriptions);
    }
  }

  /**
   * @name subscribeChainTask
   * @summary Subscribe to a chain task.
   */
  static async subscribeChainTask(task: SubscriptionTask) {
    if (this.chainSubscriptions) {
      await TaskOrchestrator.subscribeTask(task, this.chainSubscriptions);
    } else {
      throw new Error(
        'Error: SubscriptionsController::subscribeChainTask QueryMultiWrapper null'
      );
    }
  }

  /**
   * @name subscribeAccountTask
   * @summary Subscribe to an account task.
   */
  static async subscribeAccountTask(task: SubscriptionTask, account: Account) {
    await account.subscribeToTask(task);
  }

  /**
   * @name requiresApiInstanceForChain
   * @summary Returns `true` if an API instance is required for the provided chain ID for this wrapper, and `false` otherwise.
   * @returns {boolean} Represents if API instance is required for the provided chainID.
   */
  static requiresApiInstanceForChain(chainId: ChainID) {
    return this.chainSubscriptions?.requiresApiInstanceForChain(chainId);
  }

  /**
   * @name getChainSubscriptions
   * @summary Return a map of all correctly configured tasks possible for
   * a chain. Active subscriptions need to be included in the array.
   */
  static getChainSubscriptions() {
    const activeTasks = this.chainSubscriptions?.getSubscriptionTasks();

    // TODO: Populate inactive tasks with their correct arguments.
    // No chain API calls so far require arguments.

    // Merge active tasks into default tasks array.
    const allTasks = activeTasks
      ? allChainTasks.map((t) => {
          for (const active of activeTasks) {
            if (active.action === t.action && active.chainId === t.chainId) {
              return active;
            }
          }
          return t;
        })
      : allChainTasks;

    // Construct map from tasks array.
    const map = new Map<ChainID, SubscriptionTask[]>();

    for (const task of allTasks) {
      let updated = [task];

      const current = map.get(task.chainId);
      if (current) {
        updated = [...current, task];
      }

      map.set(task.chainId, updated);
    }

    return map;
  }

  /**
   * @name getAccountSubscriptions
   * @summary Return a map of all correctly configured tasks possible for the received accounts.
   * Active subscriptions need to be included in the array.
   */
  static getAccountSubscriptions(accountsMap: ImportedAccounts) {
    const result = new Map<string, SubscriptionTask[]>();

    for (const accounts of accountsMap.values()) {
      for (const a of accounts) {
        const tasks = allAccountTasks
          // Get all possible tasks for account's chain ID.
          .filter((t) => t.chainId === a.chain)
          // Populate tasks with correct arguments.
          .map((t) => {
            const task = { ...t, account: a.flatten() };

            switch (t.action) {
              case 'subscribe:query.system.account': {
                return { ...task, actionArgs: [a.address] } as SubscriptionTask;
              }
              case 'subscribe:nominationPools:query.system.account': {
                // Provide an account's nomination pool reward address if exists.
                const actionArgs = a.nominationPoolData
                  ? [a.nominationPoolData.poolRewardAddress]
                  : undefined;

                return { ...task, actionArgs } as SubscriptionTask;
              }
              case 'subscribe:nominationPoolState:query.nominationPools.bondedPools': {
                // Provide account's nomination pool id if exists.
                const actionArgs = a.nominationPoolData
                  ? [a.nominationPoolData.poolId]
                  : undefined;

                return { ...task, actionArgs } as SubscriptionTask;
              }
              default: {
                return t;
              }
            }
          })
          // Merge active tasks in the array.
          .map((t) => {
            for (const active of a.getSubscriptionTasks() || []) {
              if (active.action === t.action && active.chainId === t.chainId) {
                return active;
              }
            }
            return t;
          });

        result.set(a.address, tasks);
      }
    }

    return result;
  }
}
