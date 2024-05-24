// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './default';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { createContext, useContext, useState } from 'react';
import { encodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import type { AnyData } from '@/types/misc';
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
  /// Treasury raw public key.
  const [treasuryU8Pk, setTreasuryU8Pk] = useState<Uint8Array | null>(null);
  const [fetchingTreasuryPk, setFetchingTreasuryPk] = useState(false);

  /// Treasury free balance.
  const [treasuryFreeBalance, setTreasuryFreeBalance] = useState(
    new BigNumber(0)
  );

  /// Next burn amount.
  const [treasuryNextBurn, setTreasuryNextBurn] = useState(new BigNumber(0));

  /// Initialize context when OpenGov window loads.
  const initTreasury = () => {
    setFetchingTreasuryPk(true);

    // Send task to main renderer to fetch data using API.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:treasury:init',
      data: {
        chainId: 'Polkadot',
      },
    });
  };

  /// Setter for treasury public key.
  const setTreasuryData = (data: AnyData) => {
    const { publicKey, freeBalance, nextBurn } = data;
    setTreasuryU8Pk(publicKey);
    setTreasuryFreeBalance(new BigNumber(freeBalance));
    setTreasuryNextBurn(new BigNumber(nextBurn));
    setFetchingTreasuryPk(false);
  };

  /// Getter for the encoded treasury address.
  const getTreasuryEncodedAddress = (): string | null => {
    const prefix = 0; // Kusama 2, Substrate 42
    return treasuryU8Pk ? encodeAddress(treasuryU8Pk, prefix) : null;
  };

  /// Get readable free balance to render.
  const getFormattedFreeBalance = (): string => {
    const formatted = treasuryFreeBalance
      .dividedBy(1_000_000)
      .decimalPlaces(1)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formatted}M ${'DOT'}`;
  };

  /// Get readable next burn amount to render.
  const getFormattedNextBurn = (): string => {
    const formatted = treasuryNextBurn
      .dividedBy(1_000)
      .decimalPlaces(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formatted}K ${'DOT'}`;
  };

  return (
    <TreasuryContext.Provider
      value={{
        initTreasury,
        treasuryU8Pk,
        fetchingTreasuryPk,
        setFetchingTreasuryPk,
        setTreasuryData,
        getTreasuryEncodedAddress,
        getFormattedFreeBalance,
        getFormattedNextBurn,
      }}
    >
      {children}
    </TreasuryContext.Provider>
  );
};
