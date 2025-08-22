// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TreasuryContextInterface } from './types';

export const defaultTreasuryContext: TreasuryContextInterface = {
  initTreasury: (c) => {},
  treasuryChainId: 'Polkadot Relay',
  fetchingTreasuryData: false,
  hasFetched: false,
  getFormattedHubBalance: () => '',
  getFormattedNextBurn: () => '',
  setFetchingTreasuryData: (fetching) => {},
  setTreasuryData: (d) => {},
  getFormattedFreeBalance: () => '',
  getFormattedToBeAwarded: () => '',
  getFormattedElapsedSpendPeriod: () => '',
  getFormattedSpendPeriod: () => '',
  getSpendPeriodProgress: () => '',
  getFormattedRemainingSpendPeriod: () => '',
  refetchStats: () => {},
};
