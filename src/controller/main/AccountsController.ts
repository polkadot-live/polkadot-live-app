// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import { AppOrchestrator } from '@/orchestrators/AppOrchestrator';
import type { AnyData } from '@/types/misc';
import type { AccountSource } from '@/types/accounts';
import type { ChainID } from '@/types/chains';
import type { IpcTask } from '@/types/communication';

export class AccountsController {
  /**
   * @name process
   * @summary Process an address IPC task.
   */
  static async process(task: IpcTask): Promise<string | void> {
    switch (task.action) {
      case 'account:getAll': {
        return this.getAll();
      }
      case 'account:import': {
        await this.import(task);
        return;
      }
      case 'account:remove': {
        await this.remove(task);
        return;
      }
      case 'account:updateAll': {
        this.updateAll(task);
        return;
      }
    }
  }

  /**
   * @name import
   * @summary Import a new account from an address.
   */
  private static async import(task: IpcTask) {
    const {
      chainId,
      source,
      address,
      name,
    }: {
      chainId: ChainID;
      source: AccountSource;
      address: string;
      name: string;
    } = task.data;

    await AppOrchestrator.next({
      task: 'app:account:import',
      data: { chainId, source, address, name },
    });
  }

  /**
   * @name remove
   * @summary Remove a managed account.
   */
  private static async remove(task: IpcTask) {
    const { address }: { address: string } = task.data;

    await AppOrchestrator.next({
      task: 'app:account:remove',
      data: { address },
    });
  }

  /**
   * @name getAll
   * @summary Send persisted accounts to frontend in serialized form.
   */
  private static getAll(): string {
    const stored = (store as Record<string, AnyData>).get('imported_accounts');
    return stored ? (stored as string) : '';
  }

  /**
   * @name updateAll
   * @summary Set persisted accounts in store.
   */
  private static updateAll(task: IpcTask) {
    const { accounts }: { accounts: string } = task.data;
    (store as Record<string, AnyData>).set('imported_accounts', accounts);
  }
}
