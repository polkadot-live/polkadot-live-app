// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
  return_code: number;
  error_message: string;
}

/**
 * Data sent to renderer via IPC.
 */
export interface GetAddressMessage {
  ack: string;
  body: LedgerGetAddressResult[];
  device: { id: string; productName: string };
  options: AnyData;
  statusCode: string;
}
