// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ApiErrorStatusCode } from '@polkadot-live/types/apis';

export class ApiError extends Error {
  statusCode: ApiErrorStatusCode;

  constructor(statusCode: ApiErrorStatusCode, message = 'ApiError') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}
