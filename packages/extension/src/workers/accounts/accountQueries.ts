// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController, getBalance } from '@polkadot-live/core';
import { DbController } from '../../controllers';
import { getSupportedSources } from '@polkadot-live/consts/chains';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';

export const getAllAccounts = async (): Promise<string> => {
  const map = new Map<AccountSource, ImportedGenericAccount[]>();
  for (const source of getSupportedSources()) {
    const result = await DbController.get('accounts', source);
    map.set(source, (result as ImportedGenericAccount[]) || []);
  }
  return JSON.stringify(Array.from(map.entries()));
};

export const handleGetSpendableBalance = async (
  address: string,
  chainId: ChainID
): Promise<bigint> => {
  const api = (await APIsController.getConnectedApiOrThrow(chainId)).getApi();
  const ed = api.consts.balances.existentialDeposit;
  const balance = await getBalance(api, address, chainId);
  const { free } = balance;

  const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);
  return max(free - ed, 0n);
};
