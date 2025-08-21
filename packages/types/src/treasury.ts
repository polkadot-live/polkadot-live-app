// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface CoreTreasuryInfo {
  freeBalance: string;
  nextBurn: string;
  toBeAwardedAsStr: string;
  spendPeriodAsStr: string;
  spendPeriodElapsedBlocksAsStr: string;
}

export interface IpcTreasuryInfo {
  coreTreasuryInfo: CoreTreasuryInfo;
  statemintTreasuryInfo?: StatemintTreasuryInfo;
}

export interface StatemintAssetInfo {
  symbol: string;
  decimals: number;
}

export interface StatemintTreasuryInfo {
  usdcBalance: bigint;
  usdtBalance: bigint;
  dotBalance: bigint;
}
