// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TreasuryContextInterface } from './types';

export const defaultTreasuryContext: TreasuryContextInterface = {
  initTreasury: (c) => {},
  treasuryChainId: 'Polkadot',
  treasuryU8Pk: null,
  fetchingTreasuryData: false,
  hasFetched: false,
  getFormattedNextBurn: () => '',
  setFetchingTreasuryData: (fetching) => {},
  setTreasuryData: (d) => {},
  getTreasuryEncodedAddress: () => null,
  getFormattedFreeBalance: () => '',
  getFormattedToBeAwarded: () => '',
  getFormattedElapsedSpendPeriod: () => '',
  getFormattedSpendPeriod: () => '',
  getSpendPeriodProgress: () => '',
  getFormattedRemainingSpendPeriod: () => '',
  refetchStats: () => {},
};
