// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import { Config as ConfigMain } from '@/config/processes/main';
import type { AnyData, AnyJson } from '@/types/misc';
import type { FlattenedAccountData } from '@/types/accounts';
import type { IpcTask } from '@/types/communication';
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
  /**
   * @name process
   * @summary Process an address IPC task.
   */
  static process(task: IpcTask): string | void {
    switch (task.action) {
      // Get an account's persisted tasks in serialized form.
      case 'subscriptions:account:getAll': {
        const { address } = task.data;
        const key = ConfigMain.getSubscriptionsStorageKeyFor(address);
        const stored = (store as Record<string, AnyData>).get(key) as string;
        return stored ? stored : '';
      }
      // Get persisted chain subscription tasks.
      case 'subscriptions:chain:getAll': {
        const key = ConfigMain.getChainSubscriptionsStorageKey();
        const tasks = (store as Record<string, AnyData>).get(key) as string;
        return tasks ? tasks : '';
      }
      // Update a persisted account subscription task.
      case 'subscriptions:account:update': {
        const account: FlattenedAccountData = JSON.parse(task.data.serAccount);
        const subTask: SubscriptionTask = JSON.parse(task.data.serTask);
        this.updateAccountTaskInStore(subTask, account);
        return;
      }
      // Update a persisted chain subscription task.
      case 'subscriptions:chain:update': {
        const { serTask }: { serTask: string } = task.data;
        this.updateChainTaskInStore(JSON.parse(serTask));
        return;
      }
    }
  }

  /**
   * @name updateChainTaskInStore
   * @summary Called when a chain subscription task is received from renderer.
   */
  private static updateChainTaskInStore(task: SubscriptionTask) {
    const key = ConfigMain.getChainSubscriptionsStorageKey();

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
  private static updateAccountTaskInStore(
    task: SubscriptionTask,
    account: FlattenedAccountData
  ) {
    const key = ConfigMain.getSubscriptionsStorageKeyFor(account.address);

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
  static clearAccountTasksInStore(address: string) {
    (store as Record<string, AnyJson>).delete(
      ConfigMain.getSubscriptionsStorageKeyFor(address)
    );
  }

  /**
   * @name updateCachedAccountNameForTasks
   * @summary Called when an account is renamed.
   */
  static updateCachedAccountNameForTasks(address: string, newName: string) {
    const key = ConfigMain.getSubscriptionsStorageKeyFor(address);
    const stored = (store as Record<string, AnyData>).get(key) as string;

    if (!stored) {
      return;
    }

    const parsed: SubscriptionTask[] = JSON.parse(stored);
    if (parsed.length === 0) {
      return;
    }

    const updated = parsed.map((task) => ({
      ...task,
      account: { ...task.account, name: newName },
    }));

    (store as Record<string, AnyJson>).set(key, JSON.stringify(updated));
  }

  /*------------------------------------------------------------
   * Utilities
   *------------------------------------------------------------*/

  static updateTaskInStore(
    tasks: SubscriptionTask[],
    task: SubscriptionTask,
    key: string
  ) {
    if (task.status === 'enable') {
      // Remove task from array if it already exists.
      this.taskExistsInArray(tasks, task) &&
        (tasks = this.removeTaskFromArray(tasks, task));

      tasks.push(task);
    } else {
      // Otherwise, remove the task.
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
