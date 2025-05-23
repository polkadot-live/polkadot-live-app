// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type { AnyFunction } from '@polkadot-live/types/misc';

export interface AddressProps {
  localAddress: LocalAddress;
  setSection: AnyFunction;
}

export interface ConfirmProps {
  address: string;
  name: string;
  source: AccountSource;
}

export interface RemoveProps {
  accountName: string;
  address: string;
  source: AccountSource;
}

export interface DeleteProps {
  address: string;
  source: AccountSource;
  setSection: AnyFunction | null;
}
