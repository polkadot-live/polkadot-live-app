// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './default';
import { createContext, useContext, useState } from 'react';
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

  return (
    <TreasuryContext.Provider
      value={{
        treasuryU8Pk,
        setTreasuryU8Pk,
        fetchingTreasuryPk,
        setFetchingTreasuryPk,
      }}
    >
      {children}
    </TreasuryContext.Provider>
  );
};
