// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { accountTasks as allAccountTasks } from '@/config/accountTasks';
import { chainTasks as allChainTasks } from '@/config/chainTasks';
import { QueryMultiWrapper } from '@/model/QueryMultiWrapper';
import { store } from '@/main';
import { TaskOrchestrator } from '@/orchestrators/TaskOrchestrator';
import type { Account, ImportedAccounts } from '@/model/Account';
import type { AnyJson } from '@/types/misc';
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
    const key = 'chain_subscriptions';

    // Instantiate QueryMultiWrapper.
    this.chainSubscriptions = new QueryMultiWrapper();

    // Get and deserialize chain tasks from store.
    const tasks: SubscriptionTask[] = (store as Record<string, AnyJson>).get(
      key
    )
      ? JSON.parse((store as Record<string, AnyJson>).get(key) as string)
      : [];

    // Subscribe to tasks.
    for (const task of tasks) {
      await TaskOrchestrator.subscribeTask(task, this.chainSubscriptions);
    }
  }

  /**
   * @name subscribeChainTask
   * @summary Subscribe to a chain task received from the renderer.
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
   * @summary Subscribe to an account task received from the renderer.
   */
  static async subscribeAccountTask(task: SubscriptionTask, account: Account) {
    await account.subscribeToTask(task);
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
                return { ...task, actionArgs: [a.address] };
              }
              case 'subscribe:nominationPools:query.system.account': {
                // Provide an account's nomination pool reward address if exists.
                const actionArgs = a.nominationPoolData
                  ? [a.nominationPoolData.poolRewardAddress]
                  : undefined;

                return { ...task, actionArgs };
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

  /**
   * @name requiresApiInstanceForChain
   * @summary Returns `true` if an API instance is required for the provided chain ID for this wrapper, and `false` otherwise.
   * @returns {boolean} Represents if API instance is required for the provided chainID.
   */
  static requiresApiInstanceForChain(chainId: ChainID) {
    return this.chainSubscriptions?.requiresApiInstanceForChain(chainId);
  }

  /**
   * @name updateChainTaskInStore
   * @summary Called when a chain subscription task is received from renderer.
   */
  static updateChainTaskInStore(task: SubscriptionTask) {
    const key = 'chain_subscriptions';

    // Deserialize all tasks from store.
    const tasks: SubscriptionTask[] = (store as Record<string, AnyJson>).get(
      key
    )
      ? JSON.parse((store as Record<string, AnyJson>).get(key) as string)
      : [];

    this.updateTaskInStore(tasks, task, key);
  }

  /**
   * @name updateAccountTaskInStore
   * @summary Called when an account subscription task is received from renderer.
   */
  static updateAccountTaskInStore(task: SubscriptionTask, account: Account) {
    const key = `${account.address}_subscriptions`;

    // Deserialize the account's tasks from store.
    const tasks: SubscriptionTask[] = (store as Record<string, AnyJson>).get(
      key
    )
      ? JSON.parse((store as Record<string, AnyJson>).get(key) as string)
      : [];

    this.updateTaskInStore(tasks, task, key);
  }

  /**
   * @name clearAccountTasksInStore
   * @summary Clears an account's persisted subscriptions in the store. Invoked when an account is removed.
   */
  static clearAccountTasksInStore(account: Account) {
    (store as Record<string, AnyJson>).delete(
      `${account.address}_subscriptions`
    );
  }

  /*------------------------------------------------------------
   * Utilities
   *------------------------------------------------------------*/

  private static updateTaskInStore(
    tasks: SubscriptionTask[],
    task: SubscriptionTask,
    key: string
  ) {
    // Add or remove task depending on its status.
    if (task.status === 'enable') {
      // Remove task from array if it already exists.
      this.taskExistsInArray(tasks, task) &&
        (tasks = this.removeTaskFromArray(tasks, task));

      tasks.push(task);
    } else {
      tasks = tasks.filter(
        (t) => !(t.action === task.action && t.chainId === task.chainId)
      );
    }

    // Persist new array to store.
    (store as Record<string, AnyJson>).set(key, JSON.stringify(tasks));
  }

  private static taskExistsInArray(
    tasks: SubscriptionTask[],
    task: SubscriptionTask
  ) {
    return tasks.some(
      (t) => t.action === task.action && t.chainId === t.chainId
    );
  }

  private static removeTaskFromArray(
    tasks: SubscriptionTask[],
    task: SubscriptionTask
  ) {
    return tasks.filter(
      (t) => !(t.action === task.action && t.chainId === task.chainId)
    );
  }
}
