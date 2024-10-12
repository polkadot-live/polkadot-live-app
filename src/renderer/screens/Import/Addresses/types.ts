// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource, LocalAddress } from '@/types/accounts';
import type { AnyFunction } from '@/types/misc';

export interface AddressProps {
  localAddress: LocalAddress;
  setSection: AnyFunction;
  orderData: {
    curIndex: number;
    lastIndex: number;
  };
}

export interface ConfirmProps {
  address: string;
  name: string;
  source: AccountSource;
}

export interface RemoveProps {
  address: string;
  source: AccountSource;
}

export interface DeleteProps {
  address: string;
  source: AccountSource;
  setSection: AnyFunction | null;
}
