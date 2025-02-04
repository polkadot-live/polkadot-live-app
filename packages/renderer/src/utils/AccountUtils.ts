// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@ren/controller/AccountsController';
import BigNumber from 'bignumber.js';
import {
  BN,
  bnToU8a,
  stringToU8a,
  u8aConcat,
  u8aToString,
  u8aUnwrapBytes,
} from '@polkadot/util';
import { getAccountNominatingData } from '@app/callbacks/nominating';
import { rmCommas } from '@w3ux/utils';
import type {
  AccountBalance,
  FlattenedAccountData,
  NominationPoolCommission,
  NominationPoolRoles,
} from '@polkadot-live/types/accounts';
import type { ApiCallEntry } from '@polkadot-live/types/subscriptions';
import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { Account } from '@ren/model/Account';
import type { ApiPromise } from '@polkadot/api';
import * as ApiUtils from '@ren/utils/ApiUtils';

/**
 * @name fetchAccountBalances
 * @summary Fetch account's nonce and balance data from chain state.
 */
export const fetchAccountBalances = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching balances for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => fetchBalanceForAccount(a)));
  }
};

/**
 * @name fetchBalanceForAccount
 * @summary Fetch balance data for a single account.
 */
export const fetchBalanceForAccount = async (account: Account) => {
  if (!['Polkadot', 'Kusama', 'Westend'].includes(account.chain)) {
    return;
  }

  const origin = 'fetchBalanceForAccount';
  const { api } = await ApiUtils.getApiInstanceOrThrow(account.chain, origin);
  const result: AnyJson = await api.query.system.account(account.address);

  account.balance = {
    nonce: new BigNumber(rmCommas(String(result.nonce))),
    free: new BigNumber(rmCommas(String(result.data.free))),
    reserved: new BigNumber(rmCommas(String(result.data.reserved))),
    frozen: new BigNumber(rmCommas(String(result.data.frozen))),
  } as AccountBalance;

  await AccountsController.set(account.chain, account);
};

/**
 * @name getBalanceForAccount
 * @summary Return an account's current balance.
 */
export const getBalanceForAccount = async (
  address: string,
  chainId: ChainID
): Promise<AccountBalance> => {
  const origin = 'getBalanceForAccount';
  const { api } = await ApiUtils.getApiInstanceOrThrow(chainId, origin);
  const result: AnyJson = await api.query.system.account(address);

  const balance: AccountBalance = {
    nonce: new BigNumber(rmCommas(String(result.nonce))),
    free: new BigNumber(rmCommas(String(result.data.free))),
    reserved: new BigNumber(rmCommas(String(result.data.reserved))),
    frozen: new BigNumber(rmCommas(String(result.data.frozen))),
  };

  // Update account data if it is being managed by controller.
  const account = AccountsController.get(chainId, address);
  if (account) {
    account.balance = balance;
    await AccountsController.set(account.chain, account);
  }

  return balance;
};

/**
 * @name getExistentialDeposit
 * @summary Return the requested network's existential deposit as a big number.
 */
export const getExistentialDeposit = async (
  chainId: ChainID
): Promise<BigNumber> => {
  const origin = 'getExistentialDeposit';
  const { api } = await ApiUtils.getApiInstanceOrThrow(chainId, origin);
  return new BigNumber(
    rmCommas(String(api.consts.balances.existentialDeposit))
  );
};

/**
 * @name getSpendableBalance
 * @summary Return the requested account's spendable balance as a big number.
 */
export const getSpendableBalance = async (
  address: string,
  chainId: ChainID
): Promise<BigNumber | null> => {
  const balance = await getBalanceForAccount(address, chainId);

  // Spendable balance equation:
  // spendable = free - max(max(frozen, reserved), ed)
  const free = new BigNumber(rmCommas(String(balance.free)));
  const frozen = new BigNumber(rmCommas(String(balance.frozen)));
  const reserved = new BigNumber(rmCommas(String(balance.reserved)));
  const ed = await getExistentialDeposit(chainId);

  let spendable = free.minus(
    BigNumber.max(BigNumber.max(frozen, reserved), ed)
  );

  const zero = new BigNumber(0);
  if (spendable.lt(zero)) {
    spendable = new BigNumber(0);
  }

  return spendable;
};

/**
 * @name fetchAccountNominatingData
 * @summary Fetch an account's nominated validator ids.
 */
export const fetchAccountNominatingData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching nominating data for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => setNominatingDataForAccount(a)));
  }
};

/**
 * @name fetchNominatingDataForAccount
 * @summary Fetch nomination pool data for a single account.
 */
export const fetchNominatingDataForAccount = async (account: Account) => {
  await setNominatingDataForAccount(account);
};

/**
 * @name setNominatingDataForAccount
 * @summary Fetch nominating data for a single account.
 */
export const setNominatingDataForAccount = async (account: Account) => {
  // Only allow nominating data on specific chains.
  if (!['Polkadot', 'Kusama', 'Westend'].includes(account.chain)) {
    return;
  }

  const origin = 'setNominatingDataForAccount';
  const { api } = await ApiUtils.getApiInstanceOrThrow(account.chain, origin);

  // Set account's nominator data.
  const maybeNominatingData = await getAccountNominatingData(api, account);
  if (maybeNominatingData) {
    account.nominatingData = { ...maybeNominatingData };
  }

  // Update account data in controller.
  await AccountsController.set(account.chain, account);
};

/**
 * @name fetchAccountNominationPoolData
 * @summary Fetch nomination pool data for all accounts managed by the accounts controller.
 */
export const fetchAccountNominationPoolData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching nomination pool data for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => setNominationPoolDataForAccount(a)));
  }
};

/**
 * @name fetchNominationPoolDataForAccount
 * @summary Fetch nomination pool data for a single account.
 */
export const fetchNominationPoolDataForAccount = async (account: Account) => {
  await setNominationPoolDataForAccount(account);
};

/**
 * @name setNominationPoolDataForAccount
 * @summary Utility that uses an API instance to get and update an account's nomination
 * pool data.
 */
const setNominationPoolDataForAccount = async (account: Account) => {
  if (!['Polkadot', 'Kusama', 'Westend'].includes(account.chain)) {
    return;
  }

  const origin = 'setNominationPoolDataForAccount';
  const { api } = await ApiUtils.getApiInstanceOrThrow(account.chain, origin);
  const result: AnyJson = (
    await api.query.nominationPools.poolMembers(account.address)
  ).toJSON();

  // Return early if account is not currently in a nomination pool.
  if (result === null) {
    return;
  }

  // Get pool ID and reward address.
  const { poolId } = result;
  const { reward: poolRewardAddress } = getPoolAccounts(poolId, api);

  // Get pending rewards for the account.
  const pendingRewardsResult: AnyJson =
    await api.call.nominationPoolsApi.pendingRewards(account.address);
  const poolPendingRewards = new BigNumber(
    rmCommas(String(pendingRewardsResult))
  );

  // Get nomination pool data.
  const npResult: AnyData = (
    await api.query.nominationPools.bondedPools(poolId)
  ).toHuman();

  const poolState: string = npResult.state;
  const poolRoles: NominationPoolRoles = npResult.roles;
  const poolCommission: NominationPoolCommission = npResult.commission;

  // Get nomination pool name.
  const poolMeta: AnyData = await api.query.nominationPools.metadata(poolId);
  const poolName: string = u8aToString(u8aUnwrapBytes(poolMeta));

  if (poolRewardAddress) {
    // Add nomination pool data to account.
    account.nominationPoolData = {
      poolId,
      poolRewardAddress,
      poolPendingRewards,
      poolState,
      poolName,
      poolRoles,
      poolCommission,
    };

    // Store updated account data in controller.
    await AccountsController.set(account.chain, account);
  }
};

/**
 * @name getPoolAccounts
 * @summary Generates pool stash and reward address for a pool id.
 * @param {number} poolId - id of the pool.
 */
const getPoolAccounts = (poolId: number, api: ApiPromise) => {
  const createAccount = (pId: BigNumber, index: number): string => {
    const EmptyH256 = new Uint8Array(32);
    const ModPrefix = stringToU8a('modl');
    const U32Opts = { bitLength: 32, isLe: true };
    const poolsPalletId = api.consts.nominationPools.palletId;

    return api.registry
      .createType(
        'AccountId32',
        u8aConcat(
          ModPrefix,
          poolsPalletId.toU8a(),
          new Uint8Array([index]),
          bnToU8a(new BN(pId.toString()), U32Opts),
          EmptyH256
        )
      )
      .toString();
  };

  const poolIdBigNumber = new BigNumber(poolId);

  return {
    stash: createAccount(poolIdBigNumber, 0),
    reward: createAccount(poolIdBigNumber, 1),
  };
};

/**
 * @name getNonceForAddress
 * @summary Get the live nonce for an address.
 */
export const getAddressNonce = async (address: string, chainId: ChainID) => {
  const origin = 'getAddressNonce';
  const instance = await ApiUtils.getApiInstanceOrThrow(chainId, origin);
  const result: AnyData = await instance.api.query.system.account(address);
  return new BigNumber(rmCommas(String(result.nonce)));
};

/**
 * @name checkAccountWithProperties
 * @summary Check if account data exists with an API call entry, and if
 * the associated account, along with the passed dynamic properties, also
 * exist. Callbacks will exit early if this function fails.
 */
export const checkAccountWithProperties = (
  entry: ApiCallEntry,
  properties: (keyof Account)[]
): Account => {
  // Check for account existence and fetch it.
  if (!entry.task.account) {
    throw new Error('checkAccountWithProperties: Account not found');
  }

  // eslint-disable-next-line prettier/prettier
  const {
    chainId,
    account: { address },
  } = entry.task;
  const account = AccountsController.get(chainId, address);

  if (account === undefined) {
    throw new Error('checkAccountWithProperties: Account not found');
  }

  // Utility to access an instance property dynamically.
  const getProperty = (instance: Account, key: keyof Account): AnyData => {
    switch (key) {
      case 'balance': {
        return instance.balance;
      }
      case 'nominatingData': {
        return instance.nominatingData;
      }
      case 'nominationPoolData':
        return instance.nominationPoolData;
      default:
        return null;
    }
  };

  // Iterate properties and return false if any are undefined or null.
  for (const key of properties) {
    const result = getProperty(account, key);

    if (result === null || result === undefined) {
      throw new Error('checkAccountWithProperties: Account data not found');
    }
  }

  // Otherwise, return the account.
  return account;
};

export const checkFlattenedAccountWithProperties = (
  entry: ApiCallEntry,
  properties: (keyof FlattenedAccountData)[]
) => {
  // Check for account existence.
  if (!entry.task.account) {
    throw new Error('checkFlattenedAccountWithProperties: Account not found');
  }

  // Utility to access an instance property dynamically.
  const getProperty = (
    instance: FlattenedAccountData,
    key: keyof FlattenedAccountData
  ): AnyData => {
    switch (key) {
      case 'nominationPoolData':
        return instance.nominationPoolData;
      default:
        return null;
    }
  };

  // Iterate properties and return false if any are undefined or null.
  for (const key of properties) {
    const result = getProperty(entry.task.account, key);

    if (result === null || result === undefined) {
      throw new Error('checkFlattenedAccountWithProperties: Data not found');
    }
  }

  // Otherwise, return the account.
  return entry.task.account;
};
