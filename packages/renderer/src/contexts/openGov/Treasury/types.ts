// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';

export interface TreasuryContextInterface {
  initTreasury: (chainId: ChainID) => void;
  treasuryChainId: ChainID;
  treasuryU8Pk: Uint8Array | null;
  fetchingTreasuryData: boolean;
  hasFetched: boolean;
  getFormattedNextBurn: () => string;
  setFetchingTreasuryData: (fetching: boolean) => void;
  setTreasuryData: (data: AnyData) => void;
  getFormattedFreeBalance: () => string;
  getFormattedToBeAwarded: () => string;
  getFormattedElapsedSpendPeriod: () => string;
  getFormattedSpendPeriod: () => string;
  getSpendPeriodProgress: () => string;
  getFormattedRemainingSpendPeriod: () => string;
  refetchStats: () => void;
}
