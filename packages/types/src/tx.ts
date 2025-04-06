// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';
import type { ChainID } from './chains';
import type { AccountSource } from './accounts';

export interface PagedExtrinsicItems {
  page: number;
  pageCount: number;
  items: ExtrinsicInfo[];
}

export interface ExtFilterOption {
  filter: TxStatus;
  label: string;
  selected: boolean;
}

export type TxStatus =
  | 'pending'
  | 'submitted'
  | 'in_block'
  | 'finalized'
  | 'error'
  // Used when the app was closed before extrinsic was finalized.
  | 'submitted-unknown';

export type TxActionUid =
  | 'nominationPools_pendingRewards_bond'
  | 'nominationPools_pendingRewards_withdraw'
  | 'balances_transferKeepAlive';

export interface ActionMeta {
  // Name of account sending tx.
  accountName: string;
  // Account source.
  source: AccountSource;
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
  // Args for tx API call.
  args: AnyData;
  // Unique identifier of the action's associated event.
  eventUid?: string;
}

/**
 * Minimal account structure to associate extrinsics with an address.
 */
export interface AddressInfo {
  accountName: string;
  address: string;
  ChainIcon: AnyData;
  chainId: ChainID;
}

export interface ExtrinsicDynamicInfo {
  accountNonce: string;
  genesisHash: Uint8Array;
  txPayload: Uint8Array;
  txSignature?: `0x${string}`;
}

export interface ExtrinsicInfo {
  // Data received from the extrinsic's associated event.
  actionMeta: ActionMeta;
  // Estimated fee as a string.
  estimatedFee?: string;
  // Unique identifier for the extrinsic.
  txId: string;
  // Status of transaction.
  txStatus: TxStatus;
  // Creation timestamp.
  timestamp: number;
  // Data set dynamically before submitting the extrinsic.
  dynamicInfo?: ExtrinsicDynamicInfo;
}

/**
 * Specific data send with a transfer extrinsic.
 */
export interface ExTransferKeepAliveData {
  recipientAddress: string;
  recipientAccountName: string;
  sendAmount: string;
}
