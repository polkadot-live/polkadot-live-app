// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @todo Move to `renderer/AccountUtils.ts`
 */

import { AccountsController } from '@/controller/renderer/AccountsController';
import { planckToUnit } from '@w3ux/utils';
import { chainUnits } from '@/config/chains';
import BigNumber from 'bignumber.js';
import {
  BN,
  bnToU8a,
  stringToU8a,
  u8aConcat,
  u8aToString,
  u8aUnwrapBytes,
} from '@polkadot/util';
import type {
  AccountBalance,
  FlattenedAccountData,
  NominationPoolCommission,
  NominationPoolRoles,
} from '@/types/accounts';
import type { ApiCallEntry } from '@/types/subscriptions';
import type { AnyData, AnyJson } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type { Account } from '@/model/Account';
import type { ApiPromise } from '@polkadot/api';
import * as ApiUtils from '@/utils/ApiUtils';

/**
 * @name fetchAccountBalances
 * @summary Fetch account's nonce and balance data from chain state.
 */
export const fetchAccountBalances = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    // Only allow fetching balance data on specific chains.
    if (!['Polkadot', 'Kusama', 'Westend'].includes(chainId)) {
      continue;
    }

    const { api } = await ApiUtils.getApiInstance(chainId);

    // Iterate accounts associated with the chain and initialize balance data.
    for (const account of accounts) {
      const result: AnyJson = await api.query.system.account(account.address);

      account.balance = {
        nonce: new BigNumber(result.nonce),
        free: new BigNumber(result.data.free),
        reserved: new BigNumber(result.data.reserved),
        frozen: new BigNumber(result.data.frozen),
      } as AccountBalance;
    }
  }
};

/**
 * @name fetchAccountNominationPoolData
 * @summary Fetch nomination pool data for all accounts managed by the accounts controller.
 */
export const fetchAccountNominationPoolData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    // Only allow nomination pool data on specific chains.
    if (!['Polkadot', 'Kusama', 'Westend'].includes(chainId)) {
      continue;
    }

    const { api } = await ApiUtils.getApiInstance(chainId);
    console.log(`API instance fetched for ${chainId}`);

    // Iterate accounts associated with chain and initialise nomination pool data.
    for (const account of accounts) {
      await setNominationPoolDataForAccount(api, account, chainId);
    }
  }
};

/**
 * @name fetchNominationPoolDataForAccount
 * @summary Fetch nomination pool data for a single account.
 */
export const fetchNominationPoolDataForAccount = async (
  account: Account,
  chainId: ChainID
) => {
  if (['Polkadot', 'Kusama', 'Westend'].includes(chainId)) {
    const { api } = await ApiUtils.getApiInstance(chainId);
    await setNominationPoolDataForAccount(api, account, chainId);
  }
};

/**
 * @name setNominationPoolDataForAccount
 * @summary Utility that uses an API instance to get and update an account's nomination
 * pool data.
 */
const setNominationPoolDataForAccount = async (
  api: ApiPromise,
  account: Account,
  chainId: ChainID
) => {
  const result: AnyJson = (
    await api.query.nominationPools.poolMembers(account.address)
  ).toJSON();

  if (result === null) {
    return;
  }

  // Get pool ID and reward address.
  const { poolId } = result;
  const { reward: poolRewardAddress } = getPoolAccounts(poolId, api);

  // Get pending rewards for the account.
  const pendingRewardsResult = await api.call.nominationPoolsApi.pendingRewards(
    account.address
  );

  const poolPendingRewards = planckToUnit(
    new BigNumber(pendingRewardsResult.toString()),
    chainUnits(chainId)
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
    AccountsController.set(chainId, account);
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
  const instance = await ApiUtils.getApiInstance(chainId);
  const result: AnyData = await instance.api.query.system.account(address);
  return new BigNumber(result.nonce);
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
  const { chainId, account: { address } } = entry.task;
  const account = AccountsController.get(chainId, address);

  if (account === undefined) {
    throw new Error('checkAccountWithProperties: Account not found');
  }

  // Utility to access an instance property dynamically.
  const getProperty = (instance: Account, key: keyof Account): AnyData => {
    switch (key) {
      case 'nominationPoolData':
        return instance.nominationPoolData;
      case 'balance': {
        return instance.balance;
      }
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
