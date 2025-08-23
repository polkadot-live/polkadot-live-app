// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';
import type { ChainID } from './chains';
import type { AccountSource, LedgerMetadata } from './accounts';
import type {
  ISubmittableExtrinsic,
  SignerPayloadJSON,
  SignerPayloadRaw,
} from 'dedot/types';
import type { ExtraSignedExtension } from 'dedot';
import type { Extrinsic } from 'dedot/codecs';

export type ExtrinsicErrorStatusCode =
  | 'DynamicInfoUndefined'
  | 'ExtrinsicNotFound'
  | 'SignatureUndefined';

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
  // Cache ledger specific data.
  ledgerMeta?: LedgerMetadata;
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
  genesisHash: `0x${string}`;
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
  // Tx hash set after extrinsic finalized.
  txHash?: `0x${string}`;
}

/**
 * Specific data sent with a transfer extrinsic.
 */
export interface ExTransferKeepAliveData {
  recipientAddress: string;
  recipientAccountName: string;
  sendAmount: string;
}

/**
 * Cached extrinsic data used by extrinsics controller.
 */
type SubmittableExtrinsic = Extrinsic & ISubmittableExtrinsic;

export interface CachedExtrinsicData {
  tx: SubmittableExtrinsic;
  extra?: ExtraSignedExtension;
  // Required for signing with WalletConnect.
  payload?: SignerPayloadJSON;
  rawPayload?: SignerPayloadRaw;
  // Required for signing with Ledger.
  proof?: Uint8Array;
}
