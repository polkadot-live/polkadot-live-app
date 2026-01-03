// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as wc from '@polkadot-live/consts/walletConnect';
import { WcError } from '@polkadot-live/core';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  WalletConnectMeta,
  WcErrorStatusCode,
} from '@polkadot-live/types/walletConnect';

/**
 * Handle a WalletConnect error.
 */
export const handleWcError = (
  error: AnyData,
  origin: 'import' | 'extrinsics' | null = null
): WalletConnectMeta => {
  console.error(error);
  if (!origin) {
    return wc.wcErrorFeedback['WcCatchAll'];
  }
  if (error instanceof WcError) {
    return wc.wcErrorFeedback[error.statusCode as WcErrorStatusCode];
  }
  return error.code === -32000
    ? wc.wcErrorFeedback['WcCanceledTx']
    : wc.wcErrorFeedback['WcCatchAll'];
};
