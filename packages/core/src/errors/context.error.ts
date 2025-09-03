// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ContextErrorStatusCode } from '@polkadot-live/types/misc';

export class ContextError extends Error {
  statusCode: ContextErrorStatusCode;

  constructor(statusCode: ContextErrorStatusCode, message = 'ContextError') {
    super(message);
    this.name = 'ContextError';
    this.statusCode = statusCode;
  }
}
