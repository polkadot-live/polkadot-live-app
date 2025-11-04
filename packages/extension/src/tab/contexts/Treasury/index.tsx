// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { StatemintAssets } from '@polkadot-live/consts/treasury';
import { formatBlocksToTime } from '@polkadot-live/core';
import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook, useConnections } from '@polkadot-live/contexts';
import { rmCommas } from '@w3ux/utils';
import { chainCurrency, chainUnits } from '@polkadot-live/consts/chains';
import { renderToast } from '@polkadot-live/ui/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  IpcTreasuryInfo,
  SerIpcTreasuryInfo,
  StatemineTreasuryInfo,
  StatemintTreasuryInfo,
} from '@polkadot-live/types/treasury';
import type { TreasuryContextInterface } from '@polkadot-live/contexts/types/openGov';

export const TreasuryContext = createContext<
  TreasuryContextInterface | undefined
>(undefined);

export const useTreasury = createSafeContextHook(
  TreasuryContext,
  'TreasuryContext'
);

export const TreasuryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getOnlineMode } = useConnections();

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
  // Next burn amount and to be awarded at the end of the spend period.
  const [treasuryNextBurn, setTreasuryNextBurn] = useState(new BigNumber(0));
  const [toBeAwarded, setToBeAwarded] = useState(new BigNumber(0));

  // Spend period.
  const [spendPeriod, setSpendPeriod] = useState(new BigNumber(0));
  const [elapsedSpendPeriod, setElapsedSpendPeriod] = useState(
    new BigNumber(0)
  );

  // Statemint treasury balances.
  const [statemintTreasuryInfo, setStatemintTreasuryInfo] =
    useState<StatemintTreasuryInfo | null>(null);

  // Statemine treasury balances.
  const [statemineTreasuryInfo, setStatemineTreasuryInfo] =
    useState<StatemineTreasuryInfo | null>(null);

  // Ref to indicate if data is has been fetched and cached.
  const dataCachedRef = useRef(false);

  // Utility to parse serialized treasury info.
  const parseTreasuryInfo = (
    info: SerIpcTreasuryInfo,
    chainId: ChainID
  ): IpcTreasuryInfo => {
    switch (chainId) {
      case 'Polkadot Relay': {
        const { coreTreasuryInfo, serStatemintTreasuryInfo: ser } = info;
        return {
          coreTreasuryInfo,
          statemintTreasuryInfo: {
            usdcBalance: BigInt(ser?.usdcBalance || 0),
            usdtBalance: BigInt(ser?.usdtBalance || 0),
            dotBalance: BigInt(ser?.dotBalance || 0),
          },
        };
      }
      default: {
        const { coreTreasuryInfo, serStatemineTreasuryInfo: ser } = info;
        return {
          coreTreasuryInfo,
          statemineTreasuryInfo: {
            ksmBalance: BigInt(ser?.ksmBalance || 0),
          },
        };
      }
    }
  };

  // Initialize context when OpenGov window loads.
  const initTreasury = (chainId: ChainID) => {
    if (dataCachedRef.current && chainId === treasuryChainId) {
      return;
    }
    setFetchingTreasuryData(true);
    setTreasuryChainId(chainId);
    chrome.runtime
      .sendMessage({
        type: 'openGov',
        task: 'initTreasury',
        payload: { chainId },
      })
      .then((result: SerIpcTreasuryInfo | null) => {
        if (result !== null) {
          const info = parseTreasuryInfo(result, chainId);
          setTreasuryData(info);
        } else {
          setFetchingTreasuryData(false);
          renderToast('Error fetching treasury', 'fetch-error', 'error');
        }
      });
  };

  // Re-fetch treasury stats.
  const refetchStats = () => {
    setFetchingTreasuryData(true);
    chrome.runtime
      .sendMessage({
        type: 'openGov',
        task: 'initTreasury',
        payload: { chainId: treasuryChainId },
      })
      .then((result: SerIpcTreasuryInfo | null) => {
        if (result !== null) {
          const info = parseTreasuryInfo(result, treasuryChainId);
          setTreasuryData(info);
        } else {
          setFetchingTreasuryData(false);
          renderToast('Error fetching treasury', 'fetch-error', 'error');
        }
      });
  };

  // Setter for treasury public key.
  const setTreasuryData = (data: IpcTreasuryInfo) => {
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
    setStatemineTreasuryInfo(data.statemineTreasuryInfo || null);
    setFetchingTreasuryData(false);
    setHasFetched(true);

    // Update cached flag.
    dataCachedRef.current = true;
  };

  // Format number with unit.
  const formatWithUnit = (balance: BigNumber): string => {
    const million = new BigNumber(1_000_000);
    const thousand = new BigNumber(1_000);
    const unit: 'K' | 'M' = balance.gte(million) ? 'M' : 'K';
    const divisor = unit === 'M' ? million : thousand;

    const str = balance
      .dividedBy(divisor)
      .decimalPlaces(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return str === '0' ? str : `${str}${unit}`;
  };

  // Get readable balance for Polkadot Hub treasury assets.
  const getFormattedHubBalance = (
    assetSymbol: 'DOT' | 'KSM' | 'USDC' | 'USDT'
  ): string => {
    const relayTokens: string[] = ['DOT', 'KSM'];

    if (!relayTokens.includes(assetSymbol)) {
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
    } else if (assetSymbol === 'DOT') {
      const decimals = chainUnits('Polkadot Asset Hub');
      const balance = new BigNumber(statemintTreasuryInfo?.dotBalance || 0n);
      return `${formatWithUnit(balance.dividedBy(10 ** decimals))}`;
    } else {
      const decimals = chainUnits('Kusama Asset Hub');
      const balance = new BigNumber(statemineTreasuryInfo?.ksmBalance || 0n);
      return `${formatWithUnit(balance.dividedBy(10 ** decimals))}`;
    }
  };

  // Get readable free balance to render.
  const getFormattedFreeBalance = (): string =>
    `${hasFetched ? formatWithUnit(treasuryFreeBalance) : '0'} ${chainCurrency(treasuryChainId)}`;

  // Get readable next burn amount to render.
  const getFormattedNextBurn = (): string =>
    `${hasFetched ? formatWithUnit(treasuryNextBurn) : '0'} ${chainCurrency(treasuryChainId)}`;

  // Get readable to be awarded.
  const getFormattedToBeAwarded = (): string =>
    `${hasFetched ? formatWithUnit(toBeAwarded) : '0'} ${chainCurrency(treasuryChainId)}`;

  // Get readable elapsed spend period.
  const getFormattedElapsedSpendPeriod = (): string =>
    formatBlocksToTime(treasuryChainId, elapsedSpendPeriod.toString());

  // Get readable remaining spend period.
  const getFormattedRemainingSpendPeriod = (): string =>
    formatBlocksToTime(
      treasuryChainId,
      spendPeriod.minus(elapsedSpendPeriod).toString()
    );

  // Get readable spend period.
  const getFormattedSpendPeriod = (): string =>
    formatBlocksToTime(treasuryChainId, spendPeriod.toString());

  // Get spend period progress as percentage.
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

  useEffect(() => {
    getOnlineMode() && initTreasury(treasuryChainId);
  }, []);

  useEffect(() => {
    if (getOnlineMode()) {
      initTreasury(treasuryChainId);
    }
  }, [getOnlineMode()]);

  return (
    <TreasuryContext
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
    </TreasuryContext>
  );
};
