// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';

export interface TreasuryContextInterface {
  initTreasury: (chainId: ChainID) => void;
  treasuryChainId: ChainID;
  treasuryU8Pk: Uint8Array | null;
  fetchingTreasuryData: boolean;
  getFormattedNextBurn: () => string;
  setFetchingTreasuryData: (fetching: boolean) => void;
  setTreasuryData: (data: AnyData) => void;
  getTreasuryEncodedAddress: () => string | null;
  getFormattedFreeBalance: () => string;
  getFormattedToBeAwarded: () => string;
  getFormattedElapsedSpendPeriod: () => string;
  getFormattedSpendPeriod: () => string;
  getSpendPeriodProgress: () => string;
  getFormattedRemainingSpendPeriod: () => string;
  refetchStats: () => void;
}
