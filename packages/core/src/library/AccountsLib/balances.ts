// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController, APIsController } from '../../controllers';
import type { AccountBalance } from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { DedotClientSet } from '@polkadot-live/types/apis';

/**
 * @name getAddressNonce
 * @summary Get the current nonce for an address.
 */
export const getAddressNonce = async (
  api: DedotClientSet,
  address: string
): Promise<number> => (await api.query.system.account(address)).nonce;

/**
 * @name getBalance
 * @summary Return an account's current balance.
 */
export const getBalance = async (
  api: DedotClientSet,
  address: string,
  chainId: ChainID,
  syncAccount = true
): Promise<AccountBalance> => {
  const result = await api.query.system.account(address);

  const balance: AccountBalance = {
    nonce: BigInt(result.nonce),
    free: result.data.free,
    reserved: result.data.reserved,
    frozen: result.data.frozen,
  };

  // Update account data if it is being managed by controller.
  if (syncAccount) {
    const account = AccountsController.get(chainId, address);
    if (account) {
      account.balance = balance;
      await AccountsController.set(account);
    }
  }

  return balance;
};

/**
 * @name getSpendableBalance
 * @summary Return an account's spendable balance as a big number.
 */
export const getSpendableBalanceBrowser = async (
  address: string,
  chainId: ChainID
): Promise<string> =>
  await chrome.runtime.sendMessage({
    type: 'rawAccount',
    task: 'getSpendableBalance',
    payload: { address, chainId },
  });

export const getSpendableBalanceElectron = async (
  address: string,
  chainId: ChainID
): Promise<string> => {
  const api = (await APIsController.getConnectedApiOrThrow(chainId)).getApi();
  const ed = api.consts.balances.existentialDeposit;
  const balance = await getBalance(api, address, chainId);
  const { free } = balance;

  const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);
  return max(free - ed, 0n).toString();
};
