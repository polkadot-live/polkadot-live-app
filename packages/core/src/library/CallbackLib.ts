// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '../controllers';
import {
  getAccountNominatingData,
  getBalance,
  getNominationPoolData,
} from './AccountsLib';
import type { Account } from '../model';
import type {
  PostCallbackFlags,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';
import type {
  DedotClientSet,
  DedotStakingClient,
} from '@polkadot-live/types/apis';

/**
 * @name compareTasks
 * @summary Determine if two tasks are the same task.
 */
export const compareTasks = (
  a: SubscriptionTask,
  b: SubscriptionTask
): boolean => {
  // Different task types.
  if ((!a.account && b.account) || (a.account && !b.account)) {
    return false;
  }

  // Compare chain tasks.
  if (!a.account && !b.account) {
    return a.chainId === b.chainId && a.action === b.action;
  }

  // Account account tasks.
  if (a.account && b.account) {
    return (
      a.account.address === b.account.address &&
      a.action === b.action &&
      a.chainId === b.chainId
    );
  }

  return false;
};

/**
 * @name getPostCallbackFlags
 * @summary Get reset post callback sync flags.
 */
export const getPostCallbackFlags = (): PostCallbackFlags => ({
  syncAccountBalance: false,
  syncAccountNominating: false,
  syncAccountNominationPool: false,
});

/**
 * @name processOneShotPostCallback
 * @summary Update managed account data after a one-shot callback if necessary.
 */
export const processOneShotPostCallback = async (
  api: DedotClientSet,
  account: Account,
  syncFlags: PostCallbackFlags
) => {
  // Sync account balance.
  if (syncFlags.syncAccountBalance) {
    const { address, chain } = account;
    const balance = await getBalance(api, address, chain, false);
    account.balance = balance;
  }

  // Sync account nominating data.
  if (syncFlags.syncAccountNominating) {
    const client = api as DedotStakingClient;
    const { address } = account;
    const nominators = await api.query.staking.nominators(address);

    let result = undefined;
    if (nominators) {
      const era = (await client.query.staking.activeEra())?.index;
      if (era) {
        const fnData = { account, era, nominators };
        result = await getAccountNominatingData(client, fnData);
      }
    }
    account.nominatingData = result ?? null;
  }

  // Sync account nomination pool data.
  if (syncFlags.syncAccountNominationPool) {
    const result = await getNominationPoolData(
      account,
      api as DedotStakingClient
    );
    result && (account.nominationPoolData = result);
  }

  // Update managed account data.
  await AccountsController.set(account);

  // Reset flags.
  syncFlags = {
    syncAccountBalance: false,
    syncAccountNominating: false,
    syncAccountNominationPool: false,
  };
};
