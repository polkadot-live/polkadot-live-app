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

export class SubscriptionsController {
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
        const serializedTasks = SubscriptionsController.getChainTasks();
        return serializedTasks !== '[]' ? serializedTasks : '';
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

  // ===== Public =====

  // Clears an account's persisted subscriptions in the database.
  // Invoked when an account is removed.
  static clearAccountTasksInStore(address: string, chainId: ChainID) {
    AccountSubscriptionsRepository.clearForAddress(chainId, address);
  }

  // Return a serialized map of account subscription tasks for backup.
  static getBackupData(): string {
    return AccountSubscriptionsRepository.getAllForBackup();
  }

  // Called when an account is renamed.
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
      const params = { chainId, address, action: task.action, task };
      AccountSubscriptionsRepository.set(params);
    }
  }

  // ===== Private =====

  // Get serialized subscriptions for an address.
  private static get(address: string, chainId: ChainID): string {
    return AccountSubscriptionsRepository.getForAddress(chainId, address);
  }

  // Return all serialized chain tasks.
  private static getChainTasks(): string {
    return ChainSubscriptionsRepository.getAll();
  }

  // Persist and return new tasks.
  private static doImport(ipcTask: IpcTask) {
    // Receive serialized tasks from backup file.
    const { serialized }: { serialized: string } = ipcTask.data;
    const s_array: [string, string][] = JSON.parse(serialized);
    const s_map = new Map<string, string>(s_array);

    for (const [key, serTasks] of s_map.entries()) {
      // Clear account tasks.
      const [chainId, address] = key.split(':', 2);
      SubscriptionsController.clearAccountTasksInStore(
        address,
        chainId as ChainID,
      );
      // Persist tasks if online.
      if (OnlineStatusController.getStatus()) {
        const received: SubscriptionTask[] = JSON.parse(serTasks);
        received.forEach((t) => {
          SubscriptionsController.update(t, address, t.chainId);
        });
      }
    }
  }

  // Update a persisted account task.
  private static update(
    task: SubscriptionTask,
    address: string,
    chainId: ChainID,
  ) {
    if (task.status === 'enable') {
      // Insert or replace the task.
      const params = { chainId, address, action: task.action, task };
      AccountSubscriptionsRepository.set(params);
    } else {
      // Otherwise, remove the task.
      const params = { chainId, address, action: task.action };
      AccountSubscriptionsRepository.delete(params);
    }
  }

  // Update a persisted chain task.
  private static updateChainTask(task: SubscriptionTask) {
    if (task.status === 'enable') {
      ChainSubscriptionsRepository.set(task.chainId, task.action, task);
    } else {
      ChainSubscriptionsRepository.delete(task.chainId, task.action);
    }
  }
}
