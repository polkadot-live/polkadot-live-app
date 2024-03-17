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
  // Account data making transaction.
  account: FlattenedAccountData;
  // Type of transaction.
  action: string;
  // Network transaction is being made.
  chainId: ChainID;
  // Any data that the transaction call requires.
  data: AnyData;
  // Unique identifier of the rendered event.
  uid: string;
}
