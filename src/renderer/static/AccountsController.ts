// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

//import { store } from '@/main';
import { MainDebug } from '@/utils/DebugUtils';
import { Account } from '../model/Account';
import type { ImportedAccounts } from '../model/Account';
import type { ChainID } from '@/types/chains';
import type {
  AccountSource,
  FlattenedAccounts,
  StoredAccount,
} from '@/types/accounts';
import type { SubscriptionTask } from '@/types/subscriptions';

const debug = MainDebug.extend('Accounts');

/**
 * A static class to provide an interface for managing imported accounts.
 * @class
 * @property {ImportedAccounts} accounts - list of imported accounts, separated by chain.
 * @property {SubscriptionDelegate[]} delegators - list of delegators, their delegate and the event
 * they are listening to.
 */
export class AccountsController {
  static accounts: ImportedAccounts = new Map();

  /**
   * @name initialize
   * @summary Injects accounts into class from store.
   */
  static async initialize() {
    const stored = await window.myAPI.getPersistedAccounts();

    // Instantiate empty map if no accounts found in store.
    if (stored === '') {
      this.accounts = new Map();
      return;
    }

    // Parse serialized data into a map of StoredAccounts.
    const parsed = new Map<ChainID, StoredAccount[]>(JSON.parse(stored));
    const importedAccounts: ImportedAccounts = new Map();

    for (const [chain, accounts] of parsed) {
      const imported: Account[] = [];

      for (const a of accounts) {
        // Instantiate account.
        const account = new Account(chain, a._source, a._address, a._name);
        imported.push(account);
      }

      importedAccounts.set(chain, imported);
    }

    // Inject imported accounts into controller.
    this.accounts = importedAccounts;
  }

  /**
   * @name subscribeAccounts
   * @summary Fetched persisted tasks from the store and re-subscribe to them.
   */
  static async subscribeAccounts() {
    for (const accounts of this.accounts.values()) {
      for (const account of accounts) {
        //const key = `${account.address}_subscriptions`;

        // TODO: Send IPC message to get subscription tasks for the account.
        //const tasks = await window.myAPI.getPersistedTasks();

        //const persisted = (store as Record<string, AnyJson>).get(key);
        //const tasks = persisted ? JSON.parse(persisted as string) : [];

        const tasks: SubscriptionTask[] = [];

        for (const task of tasks) {
          await account.subscribeToTask(task);
        }
      }
    }
  }

  /**
   * @name unsubscribeAccounts
   * @summary Calls `unsub` for each account's queryMulti entries, but keeps the
   * subscription data. This method is called when the app goes into offline mode.
   */
  static unsubscribeAccounts() {
    for (const accounts of this.accounts.values()) {
      for (const account of accounts) {
        account.unsubQueryMulti();
      }
    }
  }

  /**
   * @name resubscribeAccounts
   * @summary Recalls the `queryMulti` api and subscribes to the wrapper's cached
   * subscription tasks. This method is called when the app goes into online mode.
   */
  static async resubscribeAccounts() {
    for (const accounts of this.accounts.values()) {
      for (const account of accounts) {
        const tasks = account.getSubscriptionTasks() || [];

        for (const task of tasks) {
          await account.subscribeToTask(task);
        }
      }
    }
  }

  /**
   * @name removeAllSubscriptions
   * @summary Unsubscribe from all active tasks. Called when an imported account is removed.
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
    if (tasks && tasks?.length !== 0) {
      for (const task of tasks) {
        await account.subscribeToTask(task);
      }
    }
  }

  /**
   * @name get
   * @summary Gets an account from the `accounts` property.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {string} address - the account address.
   * @returns {(Account|undefined)}
   */
  static get = (chain: ChainID, address?: string): Account | undefined =>
    this.accounts.get(chain)?.find((a) => a.address === address);

  /**
   * @name getAllFlattenedAccountData
   * @summary Gets all essential account data (flattened) for ease of use.
   * @returns {ImportedAccounts}
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
   * @name set
   * @summary Updates an Account in the `accounts` property.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {Account} account - the account to set.
   */
  static set = (chain: ChainID, account: Account) => {
    this.accounts.set(
      chain,
      this.accounts
        .get(chain)
        ?.map((a) => (a.address === account.address ? account : a)) || []
    );

    // TODO: Send IPC message to update persisted accounts in store.
    //(store as Record<string, AnyJson>).set(
    //  'imported_accounts',
    //  this.serializeAccounts()
    //);
  };

  /**
   * @name add
   * @summary Adds an account to the list of imported accounts. Fails if the account already
   * exists.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {AccountSource} source - the source of the account.
   * @param {string} address - the account address.
   * @param {string} name - the account name.
   * @returns {Account|false}
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
   * @name remove
   * @summary Removes an account from the list of imported accounts if it exists.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {string} address - the account address.
   */
  static remove = (chain: ChainID, address: string) => {
    if (this.accountExists(chain, address)) {
      // Remove account from map.
      this.setAccounts(this.spliceAccount(address));
    }
  };

  /**
   * @name pushAccount
   * @summary Pushes an account to the list of imported accounts for a chain.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {Account} account - the account to push.
   * @returns {AccountStatus}
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
   * @name spliceAccount
   * @summary Splices an account from the imported accounts list.
   * @param {string} address - the account address.
   * @returns {ImportedAccounts}
   */
  // TODO: Make private and remove WDIO test case.
  static spliceAccount = (address: string): ImportedAccounts => {
    const filtered: ImportedAccounts = new Map();

    for (const [chain, accounts] of this.accounts) {
      filtered.set(
        chain,
        accounts.filter((a) => a.address !== address)
      );
    }

    return filtered;
  };

  /**
   * @name setAccounts
   * @summary Utility to update accounts, both in class and in store.
   * @param {ImportedAccounts} accounts - the accounts object to persist to the class.
   */
  private static setAccounts = (accounts: ImportedAccounts) => {
    this.accounts = accounts;

    // TODO: Send IPC message to update persisted imported accounts.

    //(store as Record<string, AnyJson>).set(
    //  'imported_accounts',
    //  this.serializeAccounts()
    //);
    debug('🆕 Accounts updated: %o', accounts);
  };

  /**
   * @name accountExists
   * @summary Utility to check whether an account exists.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {string} address - the account address.
   * @param {AccountStatus|undefined} status - the account status to match against.
   * @returns {boolean}
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
   * @name serializeAccounts
   * @summary Serialize imported accounts for Electron store.
   * Note: Account implements toJSON method for serializing account data correctly.
   */
  private static serializeAccounts = () => {
    const serialized = JSON.stringify(Array.from(this.accounts.entries()));
    return serialized;
  };
}
