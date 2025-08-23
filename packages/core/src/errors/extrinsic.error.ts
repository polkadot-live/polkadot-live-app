// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtrinsicErrorStatusCode } from '@polkadot-live/types/tx';

export class ExtrinsicError extends Error {
  statusCode: ExtrinsicErrorStatusCode;

  constructor(
    statusCode: ExtrinsicErrorStatusCode,
    message = 'ExtrinsicError'
  ) {
    super(message);
    this.name = 'ExtrinsicError';
    this.statusCode = statusCode;
  }
}
