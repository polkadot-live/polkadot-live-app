// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { OnlineStatusController } from '../controller';
import {
  AccountSubscriptionsRepository,
  ChainSubscriptionsRepository,
} from '../db';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

/**
 * @name SubscriptionsController
 * @summary Manages subscription task persistence.
 *
 * Database tables:
 * `account_subscriptions` table for per-account, per-chain tasks
 * `chain_subscriptions` table for global chain-level tasks
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
   * @summary Get serialized subscriptions from database for an address.
   */
  private static get(address: string, chainId: ChainID): string {
    return AccountSubscriptionsRepository.getForAddress(chainId, address);
  }

  /**
   * @name getChainTasks
   * @summary Return serialized chain tasks from database.
   */
  private static getChainTasks(): string {
    return ChainSubscriptionsRepository.getAll();
  }

  /**
   * @name doImport
   * @summary Persist new tasks to database and return them to renderer to process.
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

      // Persist backed up tasks to database if online.
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
    return AccountSubscriptionsRepository.getAllForBackup();
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
    SubscriptionsController.updateTask(task, address, chainId);
  }

  /**
   * @name updateChainTask
   * @summary Update a persisted chain task with the received data.
   */
  private static updateChainTask(task: SubscriptionTask) {
    if (task.status === 'enable') {
      ChainSubscriptionsRepository.set(task.chainId, task.action, task);
    } else {
      ChainSubscriptionsRepository.delete(task.chainId, task.action);
    }
  }

  /**
   * @name clearAccountTasksInStore
   * @summary Clears an account's persisted subscriptions in the database. Invoked when an account is removed.
   */
  static clearAccountTasksInStore(address: string, chainId: ChainID) {
    AccountSubscriptionsRepository.clearForAddress(chainId, address);
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
    const tasks = AccountSubscriptionsRepository.getForAddressDeserialized(
      chainId,
      address,
    );

    if (tasks.length === 0) {
      return;
    }

    const updated = tasks.map((task) => ({
      ...task,
      account: task.account ? { ...task.account, name: newName } : undefined,
    }));

    // Update each task in the database with the new account name.
    for (const task of updated) {
      AccountSubscriptionsRepository.set(chainId, address, task.action, task);
    }
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

  private static updateTask(
    task: SubscriptionTask,
    address: string,
    chainId: ChainID,
  ) {
    if (task.status === 'enable') {
      // Get existing tasks for this account and chain.
      const existing = AccountSubscriptionsRepository.getForAddressDeserialized(
        chainId,
        address,
      );

      // Remove task if it already exists.
      if (SubscriptionsController.exists(existing, task)) {
        AccountSubscriptionsRepository.delete(chainId, address, task.action);
      }

      // Insert or replace the task.
      AccountSubscriptionsRepository.set(chainId, address, task.action, task);
    } else {
      // Otherwise, remove the task.
      AccountSubscriptionsRepository.delete(chainId, address, task.action);
    }
  }
}
