// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { AnyFunction } from '@polkadot-live/types/misc';

export interface AddressProps {
  genericAccount: ImportedGenericAccount;
  setSection: AnyFunction;
}
export interface ManageAccountsProps {
  source: AccountSource;
  setSection: React.Dispatch<React.SetStateAction<number>>;
}
