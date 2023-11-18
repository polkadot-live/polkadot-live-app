// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@polkadot-cloud/utils';
import BigNumber from 'bignumber.js';
import { getUnixTime } from 'date-fns';
import { chainCurrency, chainUnits } from '@/config/chains';
import { ChainID } from '@/types/chains';
import { APIsController } from '@/controller/APIsController';
import { AccountsController } from '@/controller/AccountsController';
import { WindowsController } from '@/controller/WindowsController';
import { MainDebug as debug } from '@/debugging';
import { Account } from '@/model/Account';
import { PolkadotAccountState } from '@/types/chains/polkadot';
import { getPoolAccounts } from './utils';
import { AccountType } from '@/types/accounts';
import { AnyJson } from '@/types/misc';

/**
 * A static class to provide callback functions for Polkadot subscriptions and discovery.
 * @class
 */
export class PolkadotCallbacks {
  static chain: ChainID = 'Polkadot';

  static defaultChainState: PolkadotAccountState = {
    inNominationPool: null,
  };

  static async bootstrap() {
    for (const { type, address, chainState } of AccountsController.accounts[
      this.chain
    ]) {
      // Delegates are not needed to bootstrap cached chain state.
      if (type === AccountType.Delegate) {
        continue;
      }
      if (chainState?.inNominationPool) {
        PolkadotCallbacks.unclaimedPoolRewards(address);
      }
    }
  }

  static getChainState = async (address: string) => {
    const apiInstance = APIsController.get(this.chain);

    const chainState = this.defaultChainState;

    if (!apiInstance) {
      return this.defaultChainState;
    }
    const { api } = apiInstance;

    // check whether account is currently in a nomination pool.
    debug(`📑 Checking if ${address} is in a nomination pool`);
    const result: AnyJson = (
      await api.query.nominationPools.poolMembers(address)
    ).toJSON();

    if (result !== null) {
      const { poolId } = result;
      debug('💠 Account is a member of pool %o', poolId);
      chainState.inNominationPool = {
        poolId,
      };

      const poolAccounts = getPoolAccounts(poolId);
      const rewardAddress = poolAccounts?.reward;

      // If the API instance is not yet initialised, reward address will be undefined. We therefore
      // need to check here.
      if (rewardAddress) {
        debug(`💵 Pool ${poolId} reward account is ${rewardAddress}`);

        // add reward account to delegators with `unclaimed_rewards` callback.
        const newDelegator = {
          address,
          delegate: {
            address: rewardAddress,
            match: {
              pallet: 'balances',
              method: 'transfer',
            },
            callback: 'unclaimed_rewards',
          },
        };

        if (!AccountsController.delegators.find((d) => d === newDelegator)) {
          AccountsController.delegators.push(newDelegator);
        }

        // add reward account to the corresponding chain's accounts list, with `balances:transfer`
        // config, if it has not been already.
        if (
          !AccountsController.getAll()[this.chain].find(
            ({ address }: Account) => address === rewardAddress
          )
        ) {
          const delegate = new Account(
            this.chain,
            AccountType.Delegate,
            'system',
            rewardAddress,
            'Reward Account'
          );
          delegate.config = {
            type: 'only',
            only: [
              {
                pallet: 'balances',
                method: 'transfer',
              },
            ],
          };

          const newAccounts = AccountsController.pushAccount(
            this.chain,
            delegate
          );
          AccountsController.setAccounts(newAccounts);
        }
      }
    }
    return chainState;
  };

  /**
   * @name unclaimedPoolRewards
   * @summary Gets unclaimed pool rewards for an account.
   * @param {string} address - the account address.
   */
  static unclaimedPoolRewards = async (address: string) => {
    debug(`💸 Checking for unclaimed pool rewards...`);
    const { api } =
      APIsController.instances.find(
        (instance) => instance.chain === this.chain
      ) || {};
    if (!api) return;

    const result = await api.call.nominationPoolsApi.pendingRewards(address);

    debug('💵 Fetched unclaimed pool rewards: %o', result.toString());

    const pendingRewards = planckToUnit(
      new BigNumber(result.toString()),
      chainUnits(this.chain)
    );

    // Dismiss and exit early if pending rewards is zero.
    if (pendingRewards.isZero()) {
      WindowsController.get('menu')?.webContents?.send('reportDismissEvent', {
        who: {
          chain: this.chain,
          address,
        },
        uid: 'nominationPools_pendingRewards',
      });
      return;
    }

    // Contruct event and report to UI.
    const newEvent = {
      uid: 'nominationPools_pendingRewards',
      category: 'nominationPools',
      who: {
        chain: this.chain,
        address,
      },
      title: 'Unclaimed Nomination Pool Rewards',
      subtitle: `${pendingRewards.toString()} ${chainCurrency(this.chain)}`,
      data: {
        pendingRewards: pendingRewards.toString(),
      },
      timestamp: getUnixTime(new Date()),
      actions: [
        {
          uri: 'bond',
          text: 'Bond',
        },
        {
          uri: 'withdraw',
          text: 'Withdraw',
        },
        {
          uri: `https://staking.polkadot.network/#/pools?n=polkadot&a=${address}`,
          text: undefined,
        },
      ],
    };

    WindowsController.get('menu')?.webContents?.send(
      'reportNewEvent',
      newEvent
    );
  };
}
