// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import type { AnyJson } from '@/types/misc';
import type { SubscriptionTask } from '@/types/subscriptions';
import type { FlattenedAccountData } from '@/types/accounts';

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
  /**
   * @name updateChainTaskInStore
   * @summary Called when a chain subscription task is received from renderer.
   * @todo In MAIN SubscriptionsController
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
   * @todo In MAIN SubscriptionsController
   */
  static updateAccountTaskInStore(
    task: SubscriptionTask,
    account: FlattenedAccountData
  ) {
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
   * @todo In MAIN SubscriptionsController
   */
  static clearAccountTasksInStore(address: string) {
    (store as Record<string, AnyJson>).delete(`${address}_subscriptions`);
  }

  /*------------------------------------------------------------
   * Utilities
   *------------------------------------------------------------*/

  // @todo In MAIN SubscriptionsController
  static updateTaskInStore(
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
