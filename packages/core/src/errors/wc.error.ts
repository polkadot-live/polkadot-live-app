// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WcErrorStatusCode } from '@polkadot-live/types/walletConnect';

export class WcError extends Error {
  statusCode: WcErrorStatusCode;

  constructor(statusCode: WcErrorStatusCode, message = 'WcError') {
    super(message);
    this.name = 'WcError';
    this.statusCode = statusCode;
  }
}
