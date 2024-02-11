import { AccountsController } from '@/controller/AccountsController';
import { WindowsController } from '@/controller/WindowsController';
import { APIsController } from '@/controller/APIsController';
import { Discover } from '@/controller/Discover';
import { getPoolAccounts } from '@/chains/Polkadot/utils';
import type { AnyJson } from '@polkadot-cloud/react/types';
import type { ChainID } from '@/types/chains';
import type { Account } from '@/model/Account';
import { planckToUnit } from '@polkadot-cloud/utils';
import { chainUnits } from '@/config/chains';
import BigNumber from 'bignumber.js';

/*
 * Fetch nomination pool data for all accounts managed by the accounts controller.
 */
export const fetchAccountNominationPoolData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    // Only allow nomination pool data on specific chains.
    if (!['Polkadot', 'Kusama', 'Westend'].includes(chainId)) {
      continue;
    }

    const apiInstance = APIsController.get(chainId);

    // TODO: Throw error if API instance not initialized.
    if (!apiInstance) {
      continue;
    }

    const { api } = apiInstance;

    // Iterate accounts associated with chain and initialise nomination pool data.
    for (const account of accounts) {
      // Get nomination pool data for address.
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
          account.nominationPoolData = {
            poolId,
            poolRewardAddress,
            poolPendingRewards,
          };

          AccountsController.set(chainId, account);
        }
      }
    }
  }
};

export const fetchNominationPoolDataForAccount = async (
  account: Account,
  chainId: ChainID
) => {
  const apiInstance = APIsController.get(chainId);

  // TODO: Throw error if API instance not initialized.
  if (!apiInstance) {
    return;
  }

  const { api } = apiInstance;

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
      account.nominationPoolData = {
        poolId,
        poolRewardAddress,
        poolPendingRewards,
      };

      AccountsController.set(chainId, account);
    }
  }
};

/**
 * @deprecated This function should no longer be used.
 */
export const initializeConfigsAndChainStates = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    for (const account of accounts) {
      const { chainState, config } = await Discover.start(chainId, account);

      account.config = config;
      account.chainState = chainState;
      AccountsController.set(chainId, account);
    }
  }

  // Report accounts to windows with updated configs.
  for (const { id } of WindowsController.active) {
    WindowsController.get(id)?.webContents?.send(
      'renderer:broadcast:accounts',
      AccountsController.getAllFlattenedAccountData()
    );
  }
};
