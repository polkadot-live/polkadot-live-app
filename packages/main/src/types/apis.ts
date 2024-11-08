// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID, ChainStatus } from './chains';

/*
 * Type for storing essential data for an API instance.
 */
export interface FlattenedAPIData {
  endpoint: string;
  chainId: ChainID;
  status: ChainStatus;
  rpcs: string[];
}
