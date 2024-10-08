// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import { Config as ConfigMain } from '@/config/processes/main';
import type { AnyData, AnyJson } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type { FlattenedAccountData, StoredAccount } from '@/types/accounts';
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
   * @summary Process a subscription IPC task.
   */
  static process(task: IpcTask): string | void {
    switch (task.action) {
      // Get an account's persisted tasks in serialized form.
      case 'subscriptions:account:getAll': {
        return this.get(task.data.address);
      }
      // Get persisted chain subscription tasks.
      case 'subscriptions:chain:getAll': {
        const ser = this.getChainTasks();
        return ser === '[]' ? '' : ser;
      }
      // Update a persisted account subscription task.
      case 'subscriptions:account:update': {
        const account: FlattenedAccountData = JSON.parse(task.data.serAccount);
        const subTask: SubscriptionTask = JSON.parse(task.data.serTask);
        this.update(subTask, account.address);
        return;
      }
      // Import tasks from a backup text file.
      case 'subscriptions:account:import': {
        return this.doImport(task);
      }
      // Update a persisted chain subscription task.
      case 'subscriptions:chain:update': {
        const { serTask }: { serTask: string } = task.data;
        this.updateChainTask(JSON.parse(serTask));
        return;
      }
    }
  }

  /**
   * @name get
   * @summary Get serialized subscriptions from store for an address.
   */
  private static get(address: string): string {
    const key = ConfigMain.getSubscriptionsStorageKeyFor(address);
    const stored = (store as Record<string, AnyData>).get(key) as string;
    return stored ? stored : '';
  }

  /**
   * @name getChainTasks
   * @summary Return serialized chain tasks in the store.
   */
  private static getChainTasks(): string {
    const key = ConfigMain.getChainSubscriptionsStorageKey();
    const stored = (store as Record<string, AnyData>).get(key) as string;
    return stored ? stored : '[]';
  }

  /**
   * @name doImport
   * @summary Persist new tasks to store and return them to renderer to process.
   * Receives serialized tasks from an exported backup file.
   */
  private static doImport(ipcTask: IpcTask): void {
    const { serialized }: { serialized: string } = ipcTask.data;
    const s_array: [string, string][] = JSON.parse(serialized);
    const s_map = new Map<string, string>(s_array);

    // Iterate map of serialized tasks keyed by an account address.
    for (const [address, serTasks] of s_map.entries()) {
      // Clear persisted tasks for an account.
      this.clearAccountTasksInStore(address);

      // Persist backed up tasks to store.
      const received: SubscriptionTask[] = JSON.parse(serTasks);
      received.forEach((t) => this.update(t, address));
    }
  }

  /**
   * @name getBackupData
   * @summary Return a serialized map of account subscription tasks for backup.
   */

  static getBackupData(): string {
    // Get imported accounts from store.
    const ser = (store as Record<string, AnyData>).get('imported_accounts');
    const ser_array: [ChainID, StoredAccount[]][] = JSON.parse(ser);
    const map_accounts = new Map<ChainID, StoredAccount[]>(ser_array);

    // Address as key and its serialized subscription tasks as value.
    const map = new Map<string, string>();

    // Copy stored account's serialized tasks into map.
    for (const accounts of map_accounts.values()) {
      for (const { _address } of accounts) {
        const key = ConfigMain.getSubscriptionsStorageKeyFor(_address);
        const ser_tasks: string =
          (store as Record<string, AnyData>).get(key) || '[]';
        map.set(_address, ser_tasks);
      }
    }

    return JSON.stringify(Array.from(map.entries()));
  }

  /**
   * @name update
   * @summary Update a persisted account task with the received data.
   */
  private static update(task: SubscriptionTask, address: string) {
    const ser = this.get(address);
    const tasks: SubscriptionTask[] = ser === '' ? [] : JSON.parse(ser);
    const key = ConfigMain.getSubscriptionsStorageKeyFor(address);
    this.updateTask(tasks, task, key);
  }

  /**
   * @name updateChainTask
   * @summary Update a persisted chain task with the received data.
   */
  private static updateChainTask(task: SubscriptionTask) {
    const key = ConfigMain.getChainSubscriptionsStorageKey();
    const tasks: SubscriptionTask[] = JSON.parse(this.getChainTasks());
    this.updateTask(tasks, task, key);
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
    const ser = this.get(address);
    const parsed: SubscriptionTask[] = ser === '' ? [] : JSON.parse(ser);

    if (parsed.length === 0) {
      return;
    }

    const updated = parsed.map((task) => ({
      ...task,
      account: { ...task.account, name: newName },
    }));

    const key = ConfigMain.getSubscriptionsStorageKeyFor(address);
    (store as Record<string, AnyJson>).set(key, JSON.stringify(updated));
  }

  /*------------------------------------------------------------
   * Utilities
   *------------------------------------------------------------*/

  /**
   * @name exists
   * @summary Check if a given subscription task exists in the given array.
   */
  private static exists(tasks: SubscriptionTask[], task: SubscriptionTask) {
    return tasks.some(
      (t) => t.action === task.action && t.chainId === t.chainId
    );
  }

  static updateTask(
    tasks: SubscriptionTask[],
    task: SubscriptionTask,
    key: string
  ) {
    if (task.status === 'enable') {
      // Remove task from array if it already exists.
      this.exists(tasks, task) &&
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

  private static removeTaskFromArray(
    tasks: SubscriptionTask[],
    task: SubscriptionTask
  ) {
    return tasks.filter(
      (t) => !(t.action === task.action && t.chainId === task.chainId)
    );
  }
}
