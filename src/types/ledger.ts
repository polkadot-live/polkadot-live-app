// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type LedgerTask = 'get_address';

export interface LedgerResponse {
  ack: string;
  statusCode: string;
}
