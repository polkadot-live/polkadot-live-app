// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type { ReferendaContextInterface } from './types';

export const ReferendaContext = createContext<ReferendaContextInterface>(
  defaults.defaultReferendaContext
);

export const useReferenda = () => useContext(ReferendaContext);

export const ReferendaProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Referenda data received from API.
  const [referenda, setReferenda] = useState<Map<string, AnyData[]>>(new Map());
  /// Chain ID for currently rendered referenda.
  const [activeReferendaChainId, setActiveReferendaChainId] =
    useState<ChainID>('Polkadot');

  return (
    <ReferendaContext.Provider
      value={{
        referenda,
        activeReferendaChainId,
        setReferenda,
        setActiveReferendaChainId,
      }}
    >
      {children}
    </ReferendaContext.Provider>
  );
};
