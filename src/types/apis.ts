// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID, ChainStatus } from './chains';

/*
 * Type for storing essential data for an API instance.
 */
export interface FlattenedAPIData {
  endpoint: string;
  chainId: ChainID;
  status: ChainStatus;
}
