// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LedgerErrorStatusCode } from '@polkadot-live/types/ledger';

export class LedgerTxError extends Error {
  statusCode: LedgerErrorStatusCode;

  constructor(statusCode: LedgerErrorStatusCode, message = 'LedgerTxError') {
    super(message);
    this.name = 'LedgerTxError';
    this.statusCode = statusCode;
  }
}
