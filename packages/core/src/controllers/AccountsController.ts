// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Account } from '../model';
import { TaskOrchestrator } from '../orchestrators';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  AccountSource,
  FlattenedAccounts,
  StoredAccount,
} from '@polkadot-live/types/accounts';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';
import type { ImportedAccounts } from '../model';

/**
 * A static class to provide an interface for managing imported accounts.
 * @class
 * @property {ImportedAccounts} accounts - list of imported accounts, separated by chain.
 */
export class AccountsController {
  static accounts: ImportedAccounts = new Map();
  static cachedSetAddresses: React.Dispatch<
    React.SetStateAction<FlattenedAccounts>
  >;
  static cachedAddressesRef: React.MutableRefObject<FlattenedAccounts>;

  /**
   * Sync react state with managed account data in controller.
   */
  static syncState = () => {
    const data = this.getAllFlattenedAccountData();
    this.cachedSetAddresses(data);
    this.cachedAddressesRef.current = data;
  };

  /**
   * Injects accounts into class from store.
   */
  static async initialize() {
    const serialized: string =
      (await window.myAPI.sendAccountTask({
        action: 'account:getAll',
        data: null,
      })) || '';

    // Instantiate empty map if no accounts exist.
    if (serialized === '') {
      this.accounts = new Map();
      return;
    }

    // Instantiate accounts.
    const parsed = new Map<ChainID, StoredAccount[]>(JSON.parse(serialized));
    for (const [chain, stored] of parsed) {
      this.accounts.set(
        chain,
        stored.map(
          ({ _source, _address, _name }) =>
            new Account(chain, _source, _address, _name)
        )
      );
    }
  }

  /**
   * Fetched persisted tasks from the store and re-subscribe to them.
   */
  static async subscribeAccounts() {
    if (!this.accounts) {
      return;
    }

    for (const accounts of this.accounts.values()) {
      for (const account of accounts) {
        const stored =
          (await window.myAPI.sendSubscriptionTask({
            action: 'subscriptions:account:getAll',
            data: { address: account.address },
          })) || '[]';

        if (account.queryMulti !== null) {
          const tasks: SubscriptionTask[] = JSON.parse(stored);
          await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);
        }
      }
    }
  }

  /**
   * Same as `subscribeAccounts` but for a specific chain.
   */
  static async subscribeAccountsForChain(chainId: ChainID) {
    // Get accounts for provided chain ID.
    const chainAccounts = this.accounts.get(chainId);
    if (!chainAccounts) {
      return;
    }

    // Resubscribe to the each account's persisted tasks.
    for (const account of chainAccounts) {
      const tasks = (account.getSubscriptionTasks() || []).filter(
        (t) => t.chainId === chainId
      );

      if (tasks.length && account.queryMulti) {
        await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);
      }
    }
  }

  /**
   * Recalls the `queryMulti` api and subscribes to the wrapper's cached
   * subscription tasks. This method is called when the app goes into online mode.
   *
   * @deprecated Currently not being called.
   */
  static async resubscribeAccounts() {
    for (const accounts of this.accounts.values()) {
      for (const account of accounts) {
        if (account.queryMulti) {
          const tasks = account.getSubscriptionTasks() || [];
          await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);
        }
      }
    }
  }

  /**
   * Unsubscribe from all active tasks. Called when an imported account is removed.
   */
  static async removeAllSubscriptions(account: Account) {
    // Get all active tasks and set their status to `disable`.
    const tasks = account.getSubscriptionTasks()?.map(
      (task) =>
        ({
          ...task,
          status: 'disable',
        }) as SubscriptionTask
    );

    // Send tasks to query multi wrapper for removal.
    if (tasks && tasks.length && account && account.queryMulti) {
      await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);

      // Remove tasks from electron store.
      // TODO: Batch removal of task data in electron store.
      for (const task of tasks) {
        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:account:update',
          data: {
            serAccount: JSON.stringify(account.flatten()),
            serTask: JSON.stringify(task),
          },
        });
      }
    }
  }

  /**
   * Gets an account from the `accounts` property.
   */
  static get = (chain: ChainID, address?: string): Account | undefined =>
    this.accounts.get(chain)?.find((a) => a.address === address);

  /**
   * Gets all essential account data (flattened) for ease of use.
   */
  static getAllFlattenedAccountData = (): FlattenedAccounts => {
    const map: FlattenedAccounts = new Map();

    for (const [chain, accounts] of this.accounts) {
      map.set(
        chain,
        accounts.map((a) => a.flatten())
      );
    }

    return map;
  };

  /**
   * Updates an Account in the `accounts` property.
   */
  static set = async (chain: ChainID, account: Account) => {
    this.accounts.set(
      chain,
      this.accounts
        .get(chain)
        ?.map((a) => (a.address === account.address ? account : a)) || []
    );

    // Send IPC message to update persisted accounts in store.
    await window.myAPI.sendAccountTask({
      action: 'account:updateAll',
      data: { accounts: this.serializeAccounts() },
    });
  };

  /**
   * Adds an account to the list of imported accounts. Fails if the account already exists.
   */
  static add = (
    chain: ChainID,
    source: AccountSource,
    address: string,
    name: string
  ): Account | false => {
    if (this.accountExists(chain, address)) {
      return false;
    } else {
      const account = new Account(chain, source, address, name);
      this.setAccounts(this.pushAccount(chain, account));
      return account;
    }
  };

  /**
   * Removes a managed account and updates store.
   */
  static remove = (chainId: ChainID, address: string) => {
    if (this.accountExists(chainId, address)) {
      const filtered = this.accounts
        .get(chainId)!
        .filter((a) => a.address !== address);

      this.accounts.set(chainId, filtered);
      this.setAccounts(this.accounts);
    }
  };

  /**
   * Pushes an account to the list of imported accounts for a chain.
   */
  private static pushAccount = (
    chain: ChainID,
    account: Account
  ): ImportedAccounts => {
    const updated: ImportedAccounts = this.accounts;
    updated.get(chain)?.push(account) || updated.set(chain, [account]);
    return updated;
  };

  /**
   * Utility to update accounts, both in class and in store.
   */
  private static setAccounts = (accounts: ImportedAccounts) => {
    this.accounts = accounts;

    // Send IPC message to update persisted imported accounts.
    window.myAPI
      .sendAccountTask({
        action: 'account:updateAll',
        data: { accounts: this.serializeAccounts() },
      })
      .then(() => {
        console.log('🆕 Accounts updated');
      });
  };

  /**
   * Utility to check whether an account exists.
   */
  private static accountExists = (chain: ChainID, address: string): boolean => {
    for (const accounts of this.accounts.values()) {
      if (accounts.find((a) => a.address === address)) {
        return true;
      }
    }

    return false;
  };

  /**
   * Serialize imported accounts for Electron store.
   * Note: Account implements toJSON method for serializing account data correctly.
   */
  private static serializeAccounts = () => {
    const serialized = JSON.stringify(Array.from(this.accounts.entries()));
    return serialized;
  };
}
