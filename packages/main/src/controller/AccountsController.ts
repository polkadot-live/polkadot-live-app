// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsRepository } from '../db';
import { NotificationsController } from './NotificationsController';
import { SubscriptionsController } from './SubscriptionsController';
import type { StoredAccount } from '@polkadot-live/types/accounts';
import type { IpcTask } from '@polkadot-live/types/communication';

export class AccountsController {
  static async process(task: IpcTask): Promise<string | undefined> {
    switch (task.action) {
      case 'account:getAll': {
        return AccountsController.getAll();
      }
      case 'account:import': {
        await AccountsController.import(task);
        return;
      }
      case 'account:remove': {
        await AccountsController.remove(task);
        return;
      }
      case 'account:update': {
        AccountsController.update(task);
        return;
      }
    }
  }

  // Get all accounts as serialized.
  private static getAll(): string {
    return AccountsRepository.getAll();
  }

  // Import a new account.
  private static async import(task: IpcTask) {
    const { accountName }: { accountName: string } = task.data;
    NotificationsController.showNotification(
      'Subscriptions Added',
      accountName,
    );
  }

  // Remove an account.
  private static async remove(task: IpcTask) {
    const { account }: { account: StoredAccount } = task.data;
    SubscriptionsController.clearAccountTasksInStore(
      account._address,
      account._chain,
    );
    AccountsRepository.delete(account._address, account._chain);
  }

  // Persist a single account (insert or update).
  private static update(task: IpcTask) {
    const { account }: { account: StoredAccount } = task.data;
    AccountsRepository.upsert(account);
  }
}
