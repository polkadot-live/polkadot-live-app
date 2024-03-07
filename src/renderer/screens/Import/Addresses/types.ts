// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from '@/types/accounts';
import type { AnyFunction } from '@w3ux/utils/types';

export interface AddressProps {
  address: string;
  index: number;
  setAddresses: AnyFunction;
  isImported: boolean;
}

export interface ConfirmProps {
  setAddresses: AnyFunction;
  address: string;
  name: string;
  source: AccountSource;
}
