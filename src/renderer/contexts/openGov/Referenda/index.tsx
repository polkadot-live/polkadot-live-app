// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { ChainID } from '@/types/chains';
import type { ReferendaContextInterface } from './types';
import type { ActiveReferendaInfo } from '@/types/openGov';

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
  const [referenda, setReferenda] = useState<ActiveReferendaInfo[]>([]);

  /// Flag to indicate that referenda is being fetched.
  const [fetchingReferenda, setFetchingReferenda] = useState(false);
  /// Chain ID for currently rendered referenda.
  const [activeReferendaChainId, setActiveReferendaChainId] =
    useState<ChainID>('Polkadot');

  /// Get all referenda sorted by most-recent id.
  const getSortedActiveReferenda = (desc: boolean) =>
    referenda.sort((a, b) =>
      desc ? b.referendaId - a.referendaId : a.referendaId - b.referendaId
    );

  return (
    <ReferendaContext.Provider
      value={{
        referenda,
        fetchingReferenda,
        activeReferendaChainId,
        setReferenda,
        setFetchingReferenda,
        setActiveReferendaChainId,
        getSortedActiveReferenda,
      }}
    >
      {children}
    </ReferendaContext.Provider>
  );
};
