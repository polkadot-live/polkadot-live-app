// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Account } from '../model';
import { getAccountNominatingData, getNominationPoolData } from '../library';
import { getStakingChains } from '@polkadot-live/consts/chains';
import { QueryError } from '../errors';
import { TaskOrchestrator } from '../orchestrators';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  AccountBalance,
  AccountSource,
  EncodedAccount,
  FlattenedAccounts,
  StoredAccount,
} from '@polkadot-live/types/accounts';
import type {
  DedotClientSet,
  DedotStakingClient,
} from '@polkadot-live/types/apis';
import type { ImportedAccounts } from '../model';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

/**
 * A static class to provide an interface for managing imported accounts.
 * @class
 * @property {ImportedAccounts} accounts - list of imported accounts, separated by chain.
 */
export class AccountsController {
  static backend: 'browser' | 'electron';
  static accounts: ImportedAccounts = new Map();

  // React state.
  static cachedSetAddresses: React.Dispatch<
    React.SetStateAction<FlattenedAccounts>
  >;
  static cachedAddressesRef: React.RefObject<FlattenedAccounts>;

  // Sync react state with managed account data in controller.
  static syncState = () => {
    const data = this.getAllFlattenedAccountData();
    if (this.backend === 'electron') {
      this.cachedSetAddresses(data);
      this.cachedAddressesRef.current = data;
    }
  };

  // Injects accounts into class from store.
  static async initialize(
    backend: 'browser' | 'electron',
    fetched?: Map<ChainID, StoredAccount[]>
  ) {
    this.backend = backend;
    switch (backend) {
      case 'electron':
        await this.initElectron();
        break;
      case 'browser':
        this.initBrowser(fetched);
        break;
    }
  }

  // Initialize accounts from indexedDB.
  static initBrowser(fetched?: Map<ChainID, StoredAccount[]>) {
    if (!fetched) {
      this.accounts = new Map();
      return;
    }
    for (const [chainId, stored] of fetched) {
      const updated = [];
      const cur = this.accounts.get(chainId) ?? [];

      for (const { _address, _source, _name } of stored) {
        if (this.accountExists(chainId, _address)) {
          continue;
        }
        updated.push(new Account(chainId, _source, _address, _name));
      }
      updated.length > 0 && this.accounts.set(chainId, [...cur, ...updated]);
    }
  }

  // Initialize accounts from Electron store.
  static async initElectron() {
    const serialized =
      (await window.myAPI.sendAccountTask({
        action: 'account:getAll',
        data: null,
      })) || '';

    if (serialized === '') {
      this.accounts = new Map();
      return;
    }
    const parsed = new Map<ChainID, StoredAccount[]>(JSON.parse(serialized));
    for (const [chain, stored] of parsed) {
      const updated = [];
      const cur = this.accounts.get(chain) ?? [];

      for (const { _address, _source, _name } of stored) {
        if (this.accountExists(chain, _address)) {
          continue;
        }
        updated.push(new Account(chain, _source, _address, _name));
      }
      updated.length > 0 && this.accounts.set(chain, [...cur, ...updated]);
    }
  }

  // Get chain IDs of managed accounts.
  static getManagedChains = (): ChainID[] => Array.from(this.accounts.keys());

  // Sync live data for all managed accounts.
  static syncAllAccounts = async (api: DedotClientSet, chainId: ChainID) => {
    let promises = [this.syncAllBalances(api, chainId)];
    if (getStakingChains().includes(chainId)) {
      promises = [
        ...promises,
        this.syncAllNominatingData(api as DedotStakingClient, chainId),
        this.syncAllNominationPoolData(api as DedotStakingClient, chainId),
      ];
    }
    await Promise.all(promises);
  };

  // Sync live data for a single managed account.
  static syncAccount = async (account: Account, api: DedotClientSet) => {
    let promises = [this.syncBalance(account, api)];
    if (getStakingChains().includes(account.chain)) {
      promises = [
        ...promises,
        this.syncNominationPoolData(account, api as DedotStakingClient),
        this.syncNominatingData(account, api as DedotStakingClient),
      ];
    }
    await Promise.all(promises);
  };

  // Fetch and build persisted tasks from the store.
  static async initAccountSubscriptions(
    backend: 'electron' | 'browser',
    active?: Map<string, SubscriptionTask[]>
  ) {
    switch (backend) {
      case 'electron': {
        if (!this.accounts) {
          return;
        }
        for (const accounts of this.accounts.values()) {
          for (const account of accounts) {
            const stored =
              (await window.myAPI.sendSubscriptionTask({
                action: 'subscriptions:account:getAll',
                data: {
                  data: { address: account.address, chainId: account.chain },
                },
              })) || '[]';
            if (account.queryMulti !== null) {
              const tasks: SubscriptionTask[] = JSON.parse(stored);
              await TaskOrchestrator.buildTasks(tasks, account.queryMulti);
            }
          }
        }
        break;
      }
      case 'browser': {
        if (!active) {
          return;
        }
        for (const [key, tasks] of active.entries()) {
          if (tasks.length) {
            const [chainId, address] = key.split(':');
            const account = this.get(chainId as ChainID, address);
            if (account && account.queryMulti) {
              await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);
            }
          }
        }
        break;
      }
    }
  }

  // Handle account subscription tasks.
  static subscribeTask = async (task: SubscriptionTask) => {
    if (!task.account?.address) {
      return;
    }
    const { address, chain } = task.account;
    const account = this.get(chain, address);

    if (account && account.queryMulti !== null) {
      await TaskOrchestrator.subscribeTask(task, account.queryMulti);
    } else {
      throw new QueryError('QueryMultiUndefined');
    }
  };

  // Same as `subscribeAccounts` but for a specific chain.
  static async subscribeAccountsForChain(chainId: ChainID) {
    const chainAccounts = this.accounts.get(chainId);
    if (!chainAccounts) {
      return;
    }
    // Resubscribe to the each account's tasks.
    for (const account of chainAccounts) {
      const tasks = (account.getSubscriptionTasks() || []).filter(
        (t) => t.chainId === chainId
      );
      if (tasks.length && account.queryMulti) {
        await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);
      }
    }
  }

  // Unsubscribe from all active tasks. Called when an imported account is removed.
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
        if (this.backend === 'electron') {
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
  }

  // Gets an account from the `accounts` property.
  static get = (chain: ChainID, address?: string): Account | undefined =>
    this.accounts.get(chain)?.find((a) => a.address === address);

  // Gets all essential account data (flattened) for ease of use.
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

  // Updates an Account in the `accounts` property and store.
  static set = async (account: Account) => {
    const chainId = account.chain;

    this.accounts.set(
      chainId,
      this.accounts
        .get(chainId)
        ?.map((a) => (a.address === account.address ? account : a)) || []
    );
    if (this.backend === 'electron') {
      await window.myAPI.sendAccountTask({
        action: 'account:updateAll',
        data: { accounts: this.serializeAccounts() },
      });
    }
  };

  // Adds a managed account. Fails if the account already exists.
  static add = (
    enAccount: EncodedAccount,
    source: AccountSource
  ): Account | false => {
    const { address, alias, chainId } = enAccount;
    if (this.accountExists(chainId, address)) {
      return false;
    }

    // Create account and add to the managed accounts map.
    const account = new Account(chainId, source, address, alias);
    this.accounts.get(chainId)?.push(account) ||
      this.accounts.set(chainId, [account]);

    this.updateStore();
    return account;
  };

  // Removes a managed account and updates store.
  static remove = (chainId: ChainID, address: string) => {
    if (this.accountExists(chainId, address)) {
      const filtered = this.accounts
        .get(chainId)!
        .filter((a) => a.address !== address);
      this.accounts.set(chainId, filtered);
      this.updateStore();
    }
  };

  // Utility to update accounts in store.
  private static updateStore = () => {
    if (this.backend === 'electron') {
      window.myAPI
        .sendAccountTask({
          action: 'account:updateAll',
          data: { accounts: this.serializeAccounts() },
        })
        .then(() => {
          console.log('🆕 Accounts updated');
        });
    }
  };

  // Utility to check whether an account exists.
  private static accountExists = (chain: ChainID, address: string): boolean => {
    for (const accounts of this.accounts.values()) {
      if (accounts.find((a) => a.address === address && a.chain === chain)) {
        return true;
      }
    }
    return false;
  };

  // Serialize imported accounts for Electron store.
  // Note: Account implements toJSON method for serializing account data correctly.
  private static serializeAccounts = () => {
    const serialized = JSON.stringify(Array.from(this.accounts.entries()));
    return serialized;
  };

  // Sync live balances for all managed accounts.
  private static syncAllBalances = async (
    api: DedotClientSet,
    chainId: ChainID
  ) => {
    console.log(`fetching balances for chain: ${chainId}`);
    const accounts = this.accounts.get(chainId);
    if (accounts) {
      await Promise.all(accounts.map((a) => this.syncBalance(a, api)));
    }
  };

  // Sync live balances for a single managed account.
  private static syncBalance = async (
    account: Account,
    api: DedotClientSet
  ) => {
    const result = await api.query.system.account(account.address);

    account.balance = {
      nonce: BigInt(result.nonce),
      free: result.data.free,
      reserved: result.data.reserved,
      frozen: result.data.frozen,
    } as AccountBalance;

    await this.set(account);
  };

  // Sync live nominating data for all managed accounts.
  private static syncAllNominatingData = async (
    api: DedotStakingClient,
    chainId: ChainID
  ) => {
    console.log(`fetching nominating data for chain: ${chainId}`);
    const accounts = this.accounts.get(chainId);
    if (accounts) {
      await Promise.all(accounts.map((a) => this.syncNominatingData(a, api)));
    }
  };

  // Sync live nominating data for a single managed accounts.
  private static syncNominatingData = async (
    account: Account,
    api: DedotStakingClient
  ) => {
    try {
      const maybeNominatingData = await getAccountNominatingData(api, account);
      account.nominatingData = maybeNominatingData
        ? { ...maybeNominatingData }
        : null;
      await this.set(account);
    } catch (err) {
      console.error(err);
    }
  };

  // Sync live nomination pool data for all managed accounts.
  private static syncAllNominationPoolData = async (
    api: DedotStakingClient,
    chainId: ChainID
  ) => {
    console.log(`fetching nomination pool data for chain: ${chainId}`);
    const accounts = this.accounts.get(chainId);
    if (accounts) {
      await Promise.all(
        accounts.map((a) => this.syncNominationPoolData(a, api))
      );
    }
  };

  // Sync live nomination pool data for a single managed accounts.
  private static syncNominationPoolData = async (
    account: Account,
    api: DedotStakingClient
  ) => {
    const result = await getNominationPoolData(account, api);
    if (result) {
      account.nominationPoolData = result;
      await this.set(account);
    }
  };
}
