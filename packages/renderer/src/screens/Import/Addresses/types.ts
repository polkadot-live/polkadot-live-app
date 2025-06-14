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

export interface ConfirmProps {
  address: string;
  publicKeyHex: string;
  name: string;
  source: AccountSource;
}

export interface RemoveProps {
  accountName: string;
  address: string;
  publicKeyHex: string;
  source: AccountSource;
}

export interface DeleteProps {
  address: string;
  publicKeyHex: string;
  source: AccountSource;
  setSection: AnyFunction | null;
}
