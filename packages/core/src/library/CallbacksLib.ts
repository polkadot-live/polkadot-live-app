// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '../controllers';
import { getBalance, getNominationPoolData } from './AccountsLib';
import { getAccountNominatingData } from './AccountsLib/nominating';
import type { Account } from '../model';
import type { PostCallbackFlags } from '@polkadot-live/types/subscriptions';
import type { RelayDedotClient } from '@polkadot-live/types/apis';

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
  api: RelayDedotClient,
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
    const result = await getAccountNominatingData(api, account);
    result && (account.nominatingData = result);
  }

  // Sync account nomination pool data.
  if (syncFlags.syncAccountNominationPool) {
    const result = await getNominationPoolData(account);
    result && (account.nominationPoolData = result);
  }

  // Update managed account data.
  await AccountsController.set(account.chain, account);

  // Reset flags.
  syncFlags = {
    syncAccountBalance: false,
    syncAccountNominating: false,
    syncAccountNominationPool: false,
  };
};
