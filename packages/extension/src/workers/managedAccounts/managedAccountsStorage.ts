// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type { Account } from '@polkadot-live/core';
import type { StoredAccount } from '@polkadot-live/types/accounts';

export const persistManagedAccount = async (account: Account) => {
  const store = 'managedAccounts';
  const json: StoredAccount = account.toJSON();
  const { _address, _chain } = json;

  const stored = ((await DbController.get(store, _chain)) ||
    []) as StoredAccount[];
  const updated = [...stored.filter((a) => a._address !== _address), json];
  await DbController.set(store, _chain, updated);
};

export const removeManagedAccount = async (account: Account) => {
  const store = 'managedAccounts';
  const json: StoredAccount = account.toJSON();
  const { _address, _chain: key } = json;
  const stored = ((await DbController.get(store, key)) ||
    []) as StoredAccount[];
  const updated = stored.filter((a) => a._address !== _address);
  await DbController.set(store, key, updated);
};
