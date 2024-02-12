import { AccountsController } from '@/controller/AccountsController';
import { getPoolAccounts } from '@/chains/Polkadot/utils';
import { planckToUnit } from '@polkadot-cloud/utils';
import { chainUnits } from '@/config/chains';
import BigNumber from 'bignumber.js';
import type { AnyJson } from '@polkadot-cloud/react/types';
import type { ChainID } from '@/types/chains';
import type { Account } from '@/model/Account';
import type { ApiPromise } from '@polkadot/api';
import { getApiInstance } from './ApiUtils';

/*
 * Fetch nomination pool data for all accounts managed by the accounts controller.
 */
export const fetchAccountNominationPoolData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    // Only allow nomination pool data on specific chains.
    if (!['Polkadot', 'Kusama', 'Westend'].includes(chainId)) {
      continue;
    }

    const { api } = await getApiInstance(chainId);

    // Iterate accounts associated with chain and initialise nomination pool data.
    for (const account of accounts) {
      await setNominationPoolDataForAccount(api, account, chainId);
    }
  }
};

/*
 * Fetch nomination pool data for a single account.
 */
export const fetchNominationPoolDataForAccount = async (
  account: Account,
  chainId: ChainID
) => {
  if (['Polkadot', 'Kusama', 'Westend'].includes(chainId)) {
    const { api } = await getApiInstance(chainId);
    await setNominationPoolDataForAccount(api, account, chainId);
  }
};

/*
 * Utility that uses an API instance to get and update an account's nomination
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

  if (result !== null) {
    // Get pool ID and reward address.
    const { poolId } = result;
    const poolRewardAddress = getPoolAccounts(poolId)?.reward;

    // Get pending rewards for the account.
    const pendingRewardsResult =
      await api.call.nominationPoolsApi.pendingRewards(account.address);

    const poolPendingRewards = planckToUnit(
      new BigNumber(pendingRewardsResult.toString()),
      chainUnits(chainId)
    );

    // Add nomination pool data to account.
    if (poolRewardAddress) {
      const map = account.nominationPoolData;

      map.set(chainId, {
        poolId,
        poolRewardAddress,
        poolPendingRewards,
      });

      // Store updated account data in controller.
      AccountsController.set(chainId, account);
    }
  }
};
