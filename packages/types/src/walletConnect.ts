// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from './chains';

export type WcErrorStatusCode =
  | 'WcCancelPending'
  | 'WcCanceledTx'
  | 'WcInsufficientTxData'
  | 'WcNotInitialized'
  | 'WcSessionError'
  | 'WcSessionNotFound';

export interface WcSelectNetwork {
  caipId: string;
  chainId: ChainID;
  selected: boolean;
}

export interface WcFetchedAddress {
  chainId: ChainID;
  encoded: string;
  publicKeyHex: string;
  substrate: string;
  selected: boolean;
}
