// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';
import type { ChainID } from './chains';

export interface WcSyncFlags {
  wcAccountApproved: boolean;
  wcConnecting: boolean;
  wcDisconnecting: boolean;
  wcInitialized: boolean;
  wcSessionRestored: boolean;
}

export interface WcSelectNetwork {
  caipId: string;
  ChainIcon: AnyData;
  chainId: ChainID;
  selected: boolean;
}

export interface WcFetchedAddress {
  chainId: ChainID;
  encoded: string;
  substrate: string;
  selected: boolean;
}
