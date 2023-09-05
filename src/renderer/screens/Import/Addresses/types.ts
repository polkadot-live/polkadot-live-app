// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
