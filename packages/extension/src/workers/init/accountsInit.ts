// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@polkadot-live/core';
import { DbController } from '../../controllers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { StoredAccount } from '@polkadot-live/types/accounts';

export const initManagedAccounts = async () => {
  type T = Map<ChainID, StoredAccount[]>;
  const fetched = (await DbController.getAllObjects('managedAccounts')) as T;
  await AccountsController.initialize('browser', fetched);
};
