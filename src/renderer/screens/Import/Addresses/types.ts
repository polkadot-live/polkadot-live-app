// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountSource } from '@polkadot-live/types';

export interface AddressProps {
  address: string;
  index: number;
}

export interface ConfirmProps {
  address: string;
  name: string;
  source: AccountSource;
}
