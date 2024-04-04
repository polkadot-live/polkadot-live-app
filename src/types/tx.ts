// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';
import type { ChainID } from './chains';
import type BigNumber from 'bignumber.js';

export type TxStatus =
  | 'pending'
  | 'submitted'
  | 'in_block'
  | 'finalized'
  | 'error';

export interface ActionMeta {
  // Account nonce.
  nonce?: BigNumber;
  // Name of account sending tx.
  accountName: string;
  // Type of transaction.
  action: string;
  // Address of tx sender.
  from: string;
  // Pallet of associated transaction.
  pallet: string;
  // Method of associated transaction.
  method: string;
  // Network transaction is being made.
  chainId: ChainID;
  // Any data that the transaction call requires.
  data: AnyData;
  // Unique identifier of the action's associated event.
  eventUid: string;
  // Args for tx API call.
  args: AnyData;
}
