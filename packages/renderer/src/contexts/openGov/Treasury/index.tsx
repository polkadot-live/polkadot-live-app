// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './default';
import BigNumber from 'bignumber.js';
import { StatemintAssets } from '@polkadot-live/consts/treasury';
import { ConfigOpenGov, formatBlocksToTime } from '@polkadot-live/core';
import { createContext, useContext, useRef, useState } from 'react';
import { rmCommas } from '@w3ux/utils';
import { chainCurrency, chainUnits } from '@polkadot-live/consts/chains';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { StatemintTreasuryInfo } from '@polkadot-live/types/treasury';
import type { TreasuryContextInterface } from './types';

export const TreasuryContext = createContext<TreasuryContextInterface>(
  defaults.defaultTreasuryContext
);

export const useTreasury = () => useContext(TreasuryContext);

export const TreasuryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Active treasury chain ID.
  const [treasuryChainId, setTreasuryChainId] =
    useState<ChainID>('Polkadot Relay');

  // Flag to determine whether treasury data is being fetched.
  const [fetchingTreasuryData, setFetchingTreasuryData] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Treasury free balance.
  const [treasuryFreeBalance, setTreasuryFreeBalance] = useState(
    new BigNumber(0)
  );

  // Next burn amount.
  const [treasuryNextBurn, setTreasuryNextBurn] = useState(new BigNumber(0));

  // To be awarded at the end of the spend period.
  const [toBeAwarded, setToBeAwarded] = useState(new BigNumber(0));

  // Spend period.
  const [spendPeriod, setSpendPeriod] = useState(new BigNumber(0));
  const [elapsedSpendPeriod, setElapsedSpendPeriod] = useState(
    new BigNumber(0)
  );

  // Statemint treasury balances.
  const [statemintTreasuryInfo, setStatemintTreasuryInfo] =
    useState<StatemintTreasuryInfo | null>(null);

  // Ref to indicate if data is has been fetched and cached.
  const dataCachedRef = useRef(false);

  // Initialize context when OpenGov window loads.
  const initTreasury = (chainId: ChainID) => {
    if (dataCachedRef.current && chainId === treasuryChainId) {
      return;
    }

    setFetchingTreasuryData(true);
    setTreasuryChainId(chainId);

    // Send task to main renderer to fetch data using API.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:treasury:init',
      data: { chainId },
    });
  };

  // Re-fetch treasury stats.
  const refetchStats = () => {
    setFetchingTreasuryData(true);

    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:treasury:init',
      data: { chainId: treasuryChainId },
    });
  };

  // Setter for treasury public key.
  const setTreasuryData = (data: AnyData) => {
    const {
      freeBalance,
      nextBurn,
      toBeAwardedAsStr,
      spendPeriodAsStr,
      spendPeriodElapsedBlocksAsStr,
    } = data.coreTreasuryInfo;

    setTreasuryFreeBalance(new BigNumber(rmCommas(freeBalance)));
    setTreasuryNextBurn(new BigNumber(rmCommas(nextBurn)));
    setToBeAwarded(new BigNumber(rmCommas(toBeAwardedAsStr)));
    setSpendPeriod(new BigNumber(rmCommas(spendPeriodAsStr)));
    setElapsedSpendPeriod(
      new BigNumber(rmCommas(spendPeriodElapsedBlocksAsStr))
    );

    setStatemintTreasuryInfo(data.statemintTreasuryInfo || null);
    setFetchingTreasuryData(false);
    setHasFetched(true);

    // Update cached flag.
    dataCachedRef.current = true;
  };

  /**
   * Format number with unit.
   */
  const formatWithUnit = (balance: BigNumber) => {
    const million = new BigNumber(1_000_000);
    const thousand = new BigNumber(1_000);
    const unit: 'K' | 'M' = balance.gte(million) ? 'M' : 'K';
    const divisor = unit === 'M' ? million : thousand;

    return balance
      .dividedBy(divisor)
      .decimalPlaces(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .concat(unit);
  };

  /**
   * Get readable balance for Polkadot Hub treasury assets.
   */
  const getFormattedHubBalance = (
    assetSymbol: 'DOT' | 'USDC' | 'USDT'
  ): string => {
    if (assetSymbol !== 'DOT') {
      const asset = Object.values(StatemintAssets).find(
        ({ symbol }) => symbol === assetSymbol
      );
      if (!asset) {
        return '-';
      }

      let balance = 0n;
      switch (assetSymbol) {
        case 'USDC':
          balance = statemintTreasuryInfo?.usdcBalance || 0n;
          break;
        case 'USDT':
          balance = statemintTreasuryInfo?.usdtBalance || 0n;
          break;
      }

      const { decimals } = asset;
      return `${formatWithUnit(new BigNumber(balance).dividedBy(10 ** decimals))}`;
    } else {
      const decimals = chainUnits('Polkadot Asset Hub');
      const balance = new BigNumber(statemintTreasuryInfo?.dotBalance || 0n);
      return `${formatWithUnit(balance.dividedBy(10 ** decimals))}`;
    }
  };

  /**
   * Get readable free balance to render.
   */
  const getFormattedFreeBalance = (): string =>
    hasFetched
      ? `${formatWithUnit(treasuryFreeBalance)} ${chainCurrency(treasuryChainId)}`
      : `0 ${chainCurrency(treasuryChainId)}`;

  /**
   * Get readable next burn amount to render.
   */
  const getFormattedNextBurn = (): string =>
    hasFetched
      ? `${formatWithUnit(treasuryNextBurn)} ${chainCurrency(treasuryChainId)}`
      : `0 ${chainCurrency(treasuryChainId)}`;

  /**
   * Get readable to be awarded.
   */
  const getFormattedToBeAwarded = (): string =>
    hasFetched
      ? `${formatWithUnit(toBeAwarded)} ${chainCurrency(treasuryChainId)}`
      : `0 ${chainCurrency(treasuryChainId)}`;

  /**
   * Get readable elapsed spend period.
   */
  const getFormattedElapsedSpendPeriod = (): string =>
    formatBlocksToTime(treasuryChainId, elapsedSpendPeriod.toString());

  /**
   * Get readable remaining spend period.
   */
  const getFormattedRemainingSpendPeriod = (): string =>
    formatBlocksToTime(
      treasuryChainId,
      spendPeriod.minus(elapsedSpendPeriod).toString()
    );

  /**
   * Get readable spend period.
   */
  const getFormattedSpendPeriod = (): string =>
    formatBlocksToTime(treasuryChainId, spendPeriod.toString());

  /**
   * Get spend period progress as percentage.
   */
  const getSpendPeriodProgress = (): string => {
    if (!hasFetched) {
      return '0%';
    } else {
      const progress = elapsedSpendPeriod
        .div(spendPeriod)
        .multipliedBy(100)
        .decimalPlaces(0);

      return `${progress.isNaN() ? '0' : progress.toString()}%`;
    }
  };

  return (
    <TreasuryContext.Provider
      value={{
        initTreasury,
        treasuryChainId,
        fetchingTreasuryData,
        hasFetched,
        setFetchingTreasuryData,
        setTreasuryData,
        getFormattedFreeBalance,
        getFormattedHubBalance,
        getFormattedNextBurn,
        getFormattedToBeAwarded,
        getFormattedElapsedSpendPeriod,
        getFormattedSpendPeriod,
        getSpendPeriodProgress,
        getFormattedRemainingSpendPeriod,
        refetchStats,
      }}
    >
      {children}
    </TreasuryContext.Provider>
  );
};
