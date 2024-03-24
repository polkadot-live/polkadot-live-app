// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from '@/types/accounts';
import type { AnyFunction } from '@w3ux/utils/types';

export interface AddressProps {
  accountName: string;
  address: string;
  index: number;
  isImported: boolean;
  setAddresses: AnyFunction;
  setSection: AnyFunction;
}

export interface ConfirmProps {
  address: string;
  setAddresses: AnyFunction;
  name: string;
  source: AccountSource;
}

export interface RemoveProps {
  address: string;
  setAddresses: AnyFunction;
  source: AccountSource;
}

export interface DeleteProps {
  address: string;
  setAddresses: AnyFunction;
  source: AccountSource;
  setSection: AnyFunction | null;
}
