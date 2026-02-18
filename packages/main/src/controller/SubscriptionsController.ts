// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigMain } from '../config/main';
import { OnlineStatusController } from '../controller';
import { store } from '../main';
import type {
  FlattenedAccountData,
  StoredAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

/**
 * Key naming convention of subscription tasks in store:
 *
 * 'chain_subscriptions'
 *   Key that stores global chain subscription tasks.
 *
 * '<chainId_account_address>_subscriptions'
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
  static process(task: IpcTask): string | undefined {
    switch (task.action) {
      // Get an account's persisted tasks in serialized form.
      case 'subscriptions:account:getAll': {
        const { address, chainId }: { address: string; chainId: ChainID } =
          task.data.data;
        return SubscriptionsController.get(address, chainId);
      }
      // Get persisted chain subscription tasks.
      case 'subscriptions:chain:getAll': {
        const ser = SubscriptionsController.getChainTasks();
        return ser === '[]' ? '' : ser;
      }
      // Update a persisted account subscription task.
      case 'subscriptions:account:update': {
        const account: FlattenedAccountData = JSON.parse(task.data.serAccount);
        const subTask: SubscriptionTask = JSON.parse(task.data.serTask);
        const { address, chain: chainId } = account;
        SubscriptionsController.update(subTask, address, chainId);
        return;
      }
      // Import tasks from a backup text file.
      case 'subscriptions:account:import': {
        SubscriptionsController.doImport(task);
        return;
      }
      // Update a persisted chain subscription task.
      case 'subscriptions:chain:update': {
        const { serTask }: { serTask: string } = task.data;
        SubscriptionsController.updateChainTask(JSON.parse(serTask));
        return;
      }
    }
  }

  /**
   * @name get
   * @summary Get serialized subscriptions from store for an address.
   */
  private static get(address: string, chainId: ChainID): string {
    const key = ConfigMain.getSubscriptionsStorageKeyFor(address, chainId);
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
  private static doImport(ipcTask: IpcTask) {
    const { serialized }: { serialized: string } = ipcTask.data;
    const s_array: [string, string][] = JSON.parse(serialized);
    const s_map = new Map<string, string>(s_array);

    // Iterate map of serialized tasks keyed by an account address.
    for (const [key, serTasks] of s_map.entries()) {
      // Clear persisted tasks for an account.
      const [chainId, address] = key.split(':', 2);
      SubscriptionsController.clearAccountTasksInStore(
        address,
        chainId as ChainID,
      );

      // Persist backed up tasks to store if online.
      if (OnlineStatusController.getStatus()) {
        const received: SubscriptionTask[] = JSON.parse(serTasks);
        received.forEach((t) => {
          SubscriptionsController.update(t, address, t.chainId);
        });
      }
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

    // ChainID:Address as key and its serialized subscription tasks as value.
    const map = new Map<string, string>();

    // Copy stored account's serialized tasks into map.
    for (const accounts of map_accounts.values()) {
      for (const { _address, _chain } of accounts) {
        const key = ConfigMain.getSubscriptionsStorageKeyFor(_address, _chain);
        const ser_tasks: string =
          (store as Record<string, AnyData>).get(key) || '[]';
        map.set(`${_chain}:${_address}`, ser_tasks);
      }
    }
    return JSON.stringify(Array.from(map.entries()));
  }

  /**
   * @name update
   * @summary Update a persisted account task with the received data.
   */
  private static update(
    task: SubscriptionTask,
    address: string,
    chainId: ChainID,
  ) {
    const ser = SubscriptionsController.get(address, task.chainId);
    const tasks: SubscriptionTask[] = ser === '' ? [] : JSON.parse(ser);
    const key = ConfigMain.getSubscriptionsStorageKeyFor(address, chainId);
    SubscriptionsController.updateTask(tasks, task, key);
  }

  /**
   * @name updateChainTask
   * @summary Update a persisted chain task with the received data.
   */
  private static updateChainTask(task: SubscriptionTask) {
    const key = ConfigMain.getChainSubscriptionsStorageKey();
    const tasks: SubscriptionTask[] = JSON.parse(
      SubscriptionsController.getChainTasks(),
    );
    SubscriptionsController.updateTask(tasks, task, key);
  }

  /**
   * @name clearAccountTasksInStore
   * @summary Clears an account's persisted subscriptions in the store. Invoked when an account is removed.
   */
  static clearAccountTasksInStore(address: string, chainId: ChainID) {
    (store as Record<string, AnyJson>).delete(
      ConfigMain.getSubscriptionsStorageKeyFor(address, chainId),
    );
  }

  /**
   * @name updateCachedAccountNameForTasks
   * @summary Called when an account is renamed.
   */
  static updateCachedAccountNameForTasks(
    address: string,
    chainId: ChainID,
    newName: string,
  ) {
    const ser = SubscriptionsController.get(address, chainId);
    const parsed: SubscriptionTask[] = ser === '' ? [] : JSON.parse(ser);

    if (parsed.length === 0) {
      return;
    }

    const updated = parsed.map((task) => ({
      ...task,
      account: { ...task.account, name: newName },
    }));

    const key = ConfigMain.getSubscriptionsStorageKeyFor(address, chainId);
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
      (t) => t.action === task.action && t.chainId === task.chainId,
    );
  }

  static updateTask(
    tasks: SubscriptionTask[],
    task: SubscriptionTask,
    key: string,
  ) {
    if (task.status === 'enable') {
      // Remove task from array if it already exists.
      if (SubscriptionsController.exists(tasks, task)) {
        tasks = SubscriptionsController.removeTaskFromArray(tasks, task);
      }

      tasks.push(task);
    } else {
      // Otherwise, remove the task.
      tasks = tasks.filter(
        (t) => !(t.action === task.action && t.chainId === task.chainId),
      );
    }

    // Persist new array to store.
    (store as Record<string, AnyJson>).set(key, JSON.stringify(tasks));
  }

  private static removeTaskFromArray(
    tasks: SubscriptionTask[],
    task: SubscriptionTask,
  ) {
    return tasks.filter(
      (t) => !(t.action === task.action && t.chainId === task.chainId),
    );
  }
}
