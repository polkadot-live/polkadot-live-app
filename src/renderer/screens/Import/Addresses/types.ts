// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from '@/types/accounts';

export interface AddressProps {
  address: string;
  index: number;
}

export interface ConfirmProps {
  address: string;
  name: string;
  source: AccountSource;
}
