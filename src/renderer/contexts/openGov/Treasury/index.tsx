// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './default';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { createContext, useContext, useState } from 'react';
import type { TreasuryContextInterface } from './types';
import { encodeAddress } from '@polkadot/util-crypto';

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
  const setTreasuryPk = (pk: Uint8Array) => {
    setTreasuryU8Pk(pk);
    setFetchingTreasuryPk(false);
  };

  /// Getter for the encoded treasury address.
  const getTreasuryEncodedAddress = (): string | null => {
    const prefix = 0; // Kusama 2, Substrate 42
    return treasuryU8Pk ? encodeAddress(treasuryU8Pk, prefix) : null;
  };

  return (
    <TreasuryContext.Provider
      value={{
        initTreasury,
        treasuryU8Pk,
        fetchingTreasuryPk,
        setFetchingTreasuryPk,
        setTreasuryPk,
        getTreasuryEncodedAddress,
      }}
    >
      {children}
    </TreasuryContext.Provider>
  );
};
