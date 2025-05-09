// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './default';
import { ConfigOpenGov, formatBlocksToTime } from '@polkadot-live/core';
import { createContext, useContext, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { rmCommas } from '@w3ux/utils';
import { chainCurrency } from '@polkadot-live/consts/chains';
import type { AnyData } from '@polkadot-live/types/misc';
import type { TreasuryContextInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';

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
  const [treasuryChainId, setTreasuryChainId] = useState<ChainID>('Polkadot');

  // Flag to determine whether treasury data is being fetched.
  const [fetchingTreasuryData, setFetchingTreasuryData] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Treasury raw public key.
  const [treasuryU8Pk, setTreasuryU8Pk] = useState<Uint8Array | null>(null);

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
      publicKey,
      freeBalance,
      nextBurn,
      toBeAwardedAsStr,
      spendPeriodAsStr,
      spendPeriodElapsedBlocksAsStr,
    } = data;

    setTreasuryU8Pk(publicKey);
    setTreasuryFreeBalance(new BigNumber(rmCommas(freeBalance)));
    setTreasuryNextBurn(new BigNumber(rmCommas(nextBurn)));
    setToBeAwarded(new BigNumber(rmCommas(toBeAwardedAsStr)));
    setSpendPeriod(new BigNumber(rmCommas(spendPeriodAsStr)));
    setElapsedSpendPeriod(
      new BigNumber(rmCommas(spendPeriodElapsedBlocksAsStr))
    );

    setFetchingTreasuryData(false);
    setHasFetched(true);

    // Update cached flag.
    dataCachedRef.current = true;
  };

  /// Get readable free balance to render.
  const getFormattedFreeBalance = (): string => {
    if (!hasFetched) {
      return `0 ${chainCurrency(treasuryChainId)}`;
    } else {
      const formatted = treasuryFreeBalance
        .dividedBy(1_000_000)
        .decimalPlaces(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return `${formatted}M ${chainCurrency(treasuryChainId)}`;
    }
  };

  /// Get readable next burn amount to render.
  const getFormattedNextBurn = (): string => {
    if (!hasFetched) {
      return `0 ${chainCurrency(treasuryChainId)}`;
    } else {
      const formatted = treasuryNextBurn
        .dividedBy(1_000)
        .decimalPlaces(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return `${formatted}K ${chainCurrency(treasuryChainId)}`;
    }
  };

  /// Get readable to be awarded.
  const getFormattedToBeAwarded = (): string => {
    if (!hasFetched) {
      return `0 ${chainCurrency(treasuryChainId)}`;
    } else {
      const formatted = toBeAwarded
        .dividedBy(1_000_000)
        .decimalPlaces(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return `${formatted}M ${chainCurrency(treasuryChainId)}`;
    }
  };

  /// Get readable elapsed spend period.
  const getFormattedElapsedSpendPeriod = (): string =>
    formatBlocksToTime(treasuryChainId, elapsedSpendPeriod.toString());

  /// Get readable remaining spend period.
  const getFormattedRemainingSpendPeriod = (): string =>
    formatBlocksToTime(
      treasuryChainId,
      spendPeriod.minus(elapsedSpendPeriod).toString()
    );

  /// Get readable spend period.
  const getFormattedSpendPeriod = (): string =>
    formatBlocksToTime(treasuryChainId, spendPeriod.toString());

  /// Get spend period progress as percentage.
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
        treasuryU8Pk,
        fetchingTreasuryData,
        hasFetched,
        setFetchingTreasuryData,
        setTreasuryData,
        getFormattedFreeBalance,
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
