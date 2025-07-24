// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';

export type LedgerTask = 'get_address';

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
  | 'TransportUndefined';

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
  ack: string;
  options: AnyData;
  statusCode: string;
  addresses?: string;
}

export interface LedgerFetchedAddressData {
  statusCode: string;
  device: { id: string; productName: string };
  body: LedgerGetAddressData;
}
