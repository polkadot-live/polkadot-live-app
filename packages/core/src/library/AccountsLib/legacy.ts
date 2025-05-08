// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainList } from '@polkadot-live/consts/chains';
import { AccountsController, APIsController } from '@core/controllers';
import {
  getAccountNominatingData,
  getNominationPoolData,
} from '@core/library/AccountsLib';
import type { AccountBalance } from '@polkadot-live/types/accounts';
import type { Account } from '@core/model/Account';

/**
 * @name setAccountBalances
 * @summary Set nonce and balance data for managed accounts.
 *
 * @todo Deprecate or move to controller.
 */
export const setAccountBalances = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching balances for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => setBalance(a)));
  }
};

/**
 * @name setBalance
 * @summary Set balance data for a single account.
 *
 * @todo Deprecate or move to controller.
 */
export const setBalance = async (account: Account) => {
  if (!Array.from(ChainList.keys()).includes(account.chain)) {
    return;
  }

  const api = (
    await APIsController.getConnectedApiOrThrow(account.chain)
  ).getApi();

  const result = await api.query.system.account(account.address);

  account.balance = {
    nonce: BigInt(result.nonce),
    free: result.data.free,
    reserved: result.data.reserved,
    frozen: result.data.frozen,
  } as AccountBalance;

  await AccountsController.set(account.chain, account);
};

/**
 * @name setAccountsNominatingData
 * @summary Set nominating data for managed accounts.
 *
 * @todo Deprecate or move to controller.
 */
export const setAccountsNominatingData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching nominating data for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => setNominatingData(a)));
  }
};

/**
 * @name setNominatingData
 * @summary Set nominating data for a single account.
 *
 * @todo Deprecate or move to controller.
 */
export const setNominatingData = async (account: Account) => {
  try {
    // Only allow nominating data on specific chains.
    if (!Array.from(ChainList.keys()).includes(account.chain)) {
      return;
    }

    const api = (
      await APIsController.getConnectedApiOrThrow(account.chain)
    ).getApi();

    // Set account's nominator data.
    const maybeNominatingData = await getAccountNominatingData(api, account);
    account.nominatingData = maybeNominatingData
      ? { ...maybeNominatingData }
      : null;

    // Update account data in controller.
    await AccountsController.set(account.chain, account);
  } catch (err) {
    console.error(err);
  }
};

/**
 * @name setAccountsNominationPoolData
 * @summary Set nomination pool data for managed accounts.
 *
 * @todo Deprecate or move to controller.
 */
export const setAccountsNominationPoolData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching nomination pool data for chain: ${chainId}`);
    await Promise.all(
      accounts.map(async (a) => {
        const result = await getNominationPoolData(a);
        if (result) {
          a.nominationPoolData = result;
          await AccountsController.set(a.chain, a);
        }
      })
    );
  }
};

/**
 * @name setNominationPoolData
 * @summary Set nomination pool data for a single account.
 *
 * @todo Deprecate or move to controller.
 */
export const setNominationPoolData = async (account: Account) => {
  const result = await getNominationPoolData(account);
  if (result) {
    account.nominationPoolData = result;
    await AccountsController.set(account.chain, account);
  }
};
