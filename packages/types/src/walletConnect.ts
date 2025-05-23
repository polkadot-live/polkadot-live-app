// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from './chains';

export interface WcSyncFlags {
  wcConnecting: boolean;
  wcDisconnecting: boolean;
  wcInitialized: boolean;
  wcSessionRestored: boolean;
  // For extrinsics.
  wcAccountApproved: boolean;
  wcVerifyingAccount: boolean;
}

export interface WcSelectNetwork {
  caipId: string;
  chainId: ChainID;
  selected: boolean;
}

export interface WcFetchedAddress {
  chainId: ChainID;
  encoded: string;
  substrate: string;
  selected: boolean;
}
