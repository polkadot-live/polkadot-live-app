// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';

export type LedgerTask = 'get_address';

export interface LedgerTaskResult {
  success: boolean;
  error?: Error;
  results?: string;
}

export interface LedgerResult {
  device: {
    id: string | undefined;
    productName: string | undefined;
  };
  body: LedgerGetAddressData;
}

export interface LedgerResponse {
  ack: string;
  statusCode: string;
}

export interface LedgerGetAddressData {
  pubKey: string;
  address: string;
}

/**
 * Data sent to renderer via IPC.
 */
export interface LedgerFetchedAddressData {
  statusCode: string;
  device: { id: string; productName: string };
  body: LedgerGetAddressData;
}

export interface GetAddressMessage {
  ack: string;
  options: AnyData;
  statusCode: string;
  addresses?: string;
}
