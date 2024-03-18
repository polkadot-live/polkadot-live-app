// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @todo Move to `renderer/AccountUtils.ts`
 */

import { AccountsController } from '@/controller/renderer/AccountsController';
import { planckToUnit } from '@w3ux/utils';
import { chainUnits } from '@/config/chains';
import BigNumber from 'bignumber.js';
import { BN, bnToU8a, stringToU8a, u8aConcat } from '@polkadot/util';
import type { AccountBalance } from '@/types/accounts';
import type { AnyJson } from '@/types/misc';
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

  if (poolRewardAddress) {
    // Add nomination pool data to account.
    account.nominationPoolData = {
      poolId,
      poolRewardAddress,
      poolPendingRewards,
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
