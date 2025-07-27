// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotGenericApp } from '@zondax/ledger-substrate';

export type LedgerTask = 'get_address' | 'close_polkadot' | 'ledger_sign';

/**
 * Return result when instantiating `PolkadotGenericApp`.
 */
export interface LedgerPolkadotApp {
  app: PolkadotGenericApp;
  ss58Prefix: number;
}

/**
 * Types for identifying Ledger devices.
 */
export type LedgerDeviceID =
  | 'blue'
  | 'nanoS'
  | 'nanoX'
  | 'nanoSP'
  | 'stax'
  | 'europa';

export interface LedgerDeviceMeta {
  deviceId: LedgerDeviceID;
  legacyUsbProductId: number;
  productIdMM: number;
  productName: LedgerProductName;
}

export type LedgerProductName =
  | 'Ledger Blue'
  | 'Ledger Nano S'
  | 'Ledger Nano X'
  | 'Ledger Nano S Plus'
  | 'Ledger Stax'
  | 'Ledger Flex';

/**
 * Types for handling Ledger errors.
 */
export interface LedgerErrorMeta {
  ack: 'failure' | 'success';
  statusCode: LedgerErrorStatusCode;
  body: { msg: string };
}

export type LedgerErrorStatusCode =
  | 'AppNotOpen'
  | 'DeviceLocked'
  | 'DeviceNotConnected'
  | 'TransactionRejected'
  | 'UnexpectedBufferEnd'
  | 'ValueOutOfRange'
  | 'WrongMetadataDigest'
  /** Custom */
  | 'TransportUndefined'
  | 'TxDataUndefined'
  | 'TxDynamicInfoUndefined'
  | 'TxLedgerMetaUndefined'
  | 'TxPayloadsUndefined';

/**
 * Ledger tasks.
 */
export interface LedgerGetAddressData {
  pubKey: string;
  address: string;
}

export interface LedgerTaskResult {
  success: boolean;
  error?: Error;
  results?: string | Uint8Array;
}

export interface LedgerResponse {
  ack: string;
  statusCode: string;
}

export interface LedgerResult {
  device: {
    id: string | undefined;
    productName: string | undefined;
  };
  body: LedgerGetAddressData;
}

/**
 * Data sent to renderer via IPC.
 */
export interface GetAddressMessage {
  options: { accountIndices: number[] };
  addresses: string;
}

export interface LedgerFetchedAddressData {
  statusCode: string;
  device: { id: string; productName: string };
  body: LedgerGetAddressData;
}

export interface LedgerTaskResponse {
  ack: 'success' | 'failure';
  statusCode: string;
  serData?: string;
}

/**
 * Feedback type for extrinsics window.
 */
export interface LedgerFeedbackMessage {
  kind: 'error';
  text: string;
}
