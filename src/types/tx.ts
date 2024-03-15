// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';
import type { ChainID } from './chains';
import type { FlattenedAccountData } from './accounts';

export type TxStatus =
  | 'pending'
  | 'submitted'
  | 'in_block'
  | 'finalized'
  | 'error';

export interface ActionMeta {
  account: FlattenedAccountData;
  action: string;
  chainId: ChainID;
  data: AnyData;
  uid: string;
}
