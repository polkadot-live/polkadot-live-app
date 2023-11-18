// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type LedgerTask = 'get_address';

export interface LedgerResponse {
  ack: string;
  statusCode: string;
}
