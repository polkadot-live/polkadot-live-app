// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { StatemintAssetInfo } from '@polkadot-live/types/treasury';

export const TreasuryAccounts = new Map<ChainID, string>([
  ['Polkadot Asset Hub', '14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'],
  ['Kusama Asset Hub', 'HWZmQq6zMMk7TxixHfseFT2ewicT6UofPa68VCn3gkXrdJF'],
]);

export const StatemintAssets: Record<number, StatemintAssetInfo> = {
  1337: { symbol: 'USDC', decimals: 6 },
  1984: { symbol: 'USDT', decimals: 6 },
};
