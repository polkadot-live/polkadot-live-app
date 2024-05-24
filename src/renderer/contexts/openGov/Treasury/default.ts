// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TreasuryContextInterface } from './types';

export const defaultTreasuryContext: TreasuryContextInterface = {
  initTreasury: () => {},
  treasuryU8Pk: null,
  fetchingTreasuryPk: false,
  getFormattedNextBurn: () => '',
  setFetchingTreasuryPk: (fetching) => {},
  setTreasuryData: (d) => {},
  getTreasuryEncodedAddress: () => null,
  getFormattedFreeBalance: () => '',
  getFormattedToBeAwarded: () => '',
  getFormattedElapsedSpendPeriod: () => '',
  getFormattedSpendPeriod: () => '',
  getSpendPeriodProgress: () => '',
  getFormattedRemainingSpendPeriod: () => '',
};
