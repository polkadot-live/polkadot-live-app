// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';

export type LedgerTask = 'get_address';

export interface LedgerResponse {
  ack: string;
  statusCode: string;
}

export interface LedgerGetAddressResult {
  pubKey: string;
  address: string;
}

/**
 * Data sent to renderer via IPC.
 */
export interface LedgerFetchedAddressData {
  statusCode: string;
  device: { id: string; productName: string };
  body: [LedgerGetAddressResult];
}

export interface GetAddressMessage {
  ack: string;
  options: AnyData;
  statusCode: string;
  addresses?: string;
}
