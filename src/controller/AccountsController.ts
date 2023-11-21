// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import { MainDebug } from '@/debugging';
import { Account } from '@/model/Account';
import { APIsController } from './APIsController';
import { WindowsController } from './WindowsController';
import type { ChainID } from '@/types/chains';
import type {
  AccountConfig,
  AccountSource,
  AccountStatus,
  ImportedAccounts,
  StoredAccounts,
} from '@/types/accounts';
import { AccountType } from '@/types/accounts';
import type { IMatch, SubscriptionDelegate } from '@/types/blockstream';
import type { AnyJson } from '@/types/misc';
import type { ReportDelegator } from '@/types/reporter';

const debug = MainDebug.extend('Accounts');

/**
 * A static class to provide an interface for managing imported accounts.
 * @class
 * @property {ImportedAccounts} accounts - list of imported accounts, separated by chain.
 * @property {SubscriptionDelegate[]} delegators - list of delegators, their delegate and the event
 * they are listening to.
 */
export class AccountsController {
  static accounts: ImportedAccounts;

  static delegators: SubscriptionDelegate[] = [];

  /**
   * @name initialize
   * @summary Injects accounts into class from store.
   */
  static initialize() {
    // Get accounts from store.
    const storeAccounts = store.get('imported_accounts') as StoredAccounts;
    if (!storeAccounts) {
      this.accounts = {};
      return;
    }

    let initAccounts: ImportedAccounts = {};
    for (const chain of Object.keys(storeAccounts) as ChainID[]) {
      const initChain = [];
      for (const a of storeAccounts[chain]) {
        // Ignore delegate accounts: they are instantiated in `Discovery.start()`.
        if (a._type !== AccountType.Delegate) {
          // Instantiate account.
          const account = new Account(
            chain,
            AccountType.User,
            a._source,
            a._address,
            a._name
          );
          account.config = a._config;
          account.chainState = a._chainState;
          initChain.push(account);
        }
      }
      if (!Object.values(initAccounts)) {
        initAccounts = { [chain]: initChain };
      } else {
        initAccounts[chain] = initChain;
      }
    }

    // Inject accounts into class.
    this.accounts = initAccounts;
  }

  /**
   * @name get
   * @summary Gets an account from the `accounts` property.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {string} address - the account address.
   * @returns {(Account|undefined)}
   */
  static get = (chain: ChainID, address: string): Account | undefined =>
    this.accounts[chain]?.find((a) => a.address === address) || undefined;

  /**
   * @name getAll
   * @summary Gets all accounts.
   * @returns {ImportedAccounts}
   */
  static getAll = (): ImportedAccounts => {
    const accounts: AnyJson = {};
    for (const chain of Object.keys(this.accounts)) {
      accounts[chain] = this.accounts[chain].map((a) => a.format());
    }
    return accounts;
  };

  /**
   * @name set
   * @summary Updates an Account in the `accounts` property.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {Account} account - the account to set.
   */
  static set = (chain: ChainID, account: Account) => {
    this.accounts[chain] =
      this.accounts[chain]?.map((a) =>
        a.address === account.address ? account : a
      ) || [];
    store.set('imported_accounts', this.accounts);
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
      const account = new Account(
        chain,
        AccountType.User,
        source,
        address,
        name
      );
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
  static remove = async (chain: ChainID, address: string) => {
    if (this.accountExists(chain, address)) {
      // Remove account from record.
      this.setAccounts(this.spliceAccount(address));

      // Get entries from delegators` where address is the delegator.
      const delegatorsForRemoval = this.delegators.filter(
        (d) => d.address === address
      );

      debug('⛔ Delegators for removal: ', delegatorsForRemoval);

      if (delegatorsForRemoval) {
        // Get delegates that potentially have no more delegators.
        const delegates = delegatorsForRemoval.map((d) => d.delegate);
        debug(
          '📛 Delegate accounts maybe not have any more delegators: %o',
          delegates
        );

        // Update delegator record.
        this.delegators = AccountsController.delegators.filter(
          (d) => !delegatorsForRemoval.includes(d)
        );

        // Among removed entries, if the delegate does not exist for any other delegator, remove
        // it's account.
        for (const d of delegates) {
          if (
            !this.delegators.find(
              ({ delegate }) => delegate.address === d.address
            )
          ) {
            debug('🟡 Splicing delegate account  %o', d.address);
            // Remove delegate account from record.
            this.setAccounts(this.spliceAccount(d.address));
          }
        }
      }

      // Remove chain if no more accounts exist.
      if (!this.accounts[chain]?.length) {
        APIsController.close(chain);

        // Report to active windows that chain has been removed.
        WindowsController.active.forEach(({ id }: AnyJson) => {
          WindowsController.get(id)?.webContents?.send(
            'renderer:chain:removed',
            chain
          );
        });
      }
    }
  };

  /**
   * @name status
   * @summary Get an account status. Account must exist and have a config saved for it to be
   * active.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {string} address - the account address.
   * @returns {AccountStatus}
   */
  static status = (chain: ChainID, address: string): AccountStatus => {
    const account = this.get(chain, address);
    return account
      ? account.config === null
        ? 'pending'
        : 'active'
      : 'does_not_exist';
  };

  /**
   * @name pushAccount
   * @summary Pushes an account to the list of imported accounts for a chain.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {Account} account - the account to push.
   * @returns {AccountStatus}
   */
  static pushAccount = (chain: ChainID, account: Account): ImportedAccounts => {
    let newAccounts: ImportedAccounts = this.accounts;
    const chainAccounts = newAccounts[chain] || [];
    newAccounts = Object.assign(
      newAccounts,
      {},
      {
        [chain]: chainAccounts.concat(account),
      }
    );
    return newAccounts;
  };

  /**
   * @name spliceAccount
   * @summary Splices an account from the imported accounts list.
   * @param {string} address - the account address.
   * @returns {ImportedAccounts}
   */
  static spliceAccount = (address: string): ImportedAccounts => {
    return Object.fromEntries(
      Object.entries({ ...this.accounts }).map(([n, imported]) => {
        return [
          n,
          imported.filter((account: Account) => account.address !== address),
        ];
      })
    );
  };

  /**
   * @name getDelegatorsOfAddress
   * @summary Searches `Accounts.delegators` for entries where the provided address is the
   * delegate.
   * @param {string} address - the account address.
   * @param {IMatch} match - the pallet and method to match against.
   * @returns {ReportDelegator[]}
   */
  static getDelegatorsOfAddress = (
    address: string,
    match: IMatch
  ): ReportDelegator[] =>
    (
      this.delegators.filter(
        (d) => d.delegate.address === address && d.delegate.match === match
      ) || []
    ).map((d) => ({
      delegator: d.address,
      callback: d.delegate.callback,
    }));

  /**
   * @name setAccountConfig
   * @summary Utility to update account config.
   * @param {AccountConfig} - the account config derived from discovery.
   */
  static setAccountConfig = (
    { config, chainState }: AccountConfig,
    account: Account
  ) => {
    account.config = config;
    account.chainState = chainState;
    AccountsController.set(account.chain, account);

    debug('🆕 Accounted account config: %o', account);
  };

  /**
   * @name setAccounts
   * @summary Utility to update accounts, both in class and in store.
   * @param {ImportedAccounts} accounts - the accounts object to persist to the class.
   */
  static setAccounts = (accounts: ImportedAccounts) => {
    this.accounts = accounts;
    store.set('imported_accounts', this.accounts);
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
  private static accountExists = (
    chain: ChainID,
    address: string,
    status?: AccountStatus
  ): boolean => {
    const matchStatus = (item: Account) =>
      status !== undefined ? this.status(chain, item.address) === status : true;

    return (
      Object.values(this.accounts).find((items) =>
        items.find((item) => item.address === address && matchStatus(item))
      ) !== undefined
    );
  };
}
