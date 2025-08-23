// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { QueryErrorStatusCode } from '@polkadot-live/types/subscriptions';

export class QueryError extends Error {
  statusCode: QueryErrorStatusCode;

  constructor(statusCode: QueryErrorStatusCode, message = 'QueryError') {
    super(message);
    this.name = 'QueryError';
    this.statusCode = statusCode;
  }
}
