// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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

export type TxActionUid =
  | 'nominationPools_pendingRewards_bond'
  | 'nominationPools_pendingRewards_withdraw';

export interface ActionMeta {
  // Name of account sending tx.
  accountName: string;
  // Type of transaction.
  action: TxActionUid;
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

/**
 * Minimal account structure to associate extrinsics with an address.
 */
export interface AddressInfo {
  accountName: string;
  address: string;
  chainId: ChainID;
}

export interface ExtrinsicDynamicInfo {
  accountNonce: BigNumber;
  estimatedFee: string;
  genesisHash: Uint8Array;
  txPayload: Uint8Array;
  txSignature?: `0x${string}`;
}

export interface ExtrinsicInfo {
  // Data received from the extrinsic's associated event.
  actionMeta: ActionMeta;
  // Unique identifier for the extrinsic.
  txId: string;
  // Status of transaction.
  txStatus: TxStatus;
  // Data set dynamically before submitting the extrinsic.
  dynamicInfo?: ExtrinsicDynamicInfo;
  // Whether the extrinsic is submitting.
  submitting: boolean;
}
