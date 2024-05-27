// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { ChainID } from '@/types/chains';
import type { ReferendaContextInterface } from './types';
import type { ActiveReferendaInfo } from '@/types/openGov';
import { getOrderedOrigins } from '@/renderer/screens/OpenGov/utils';

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

  /// Get all referenda sorted by desc or asc.
  const getSortedActiveReferenda = (desc: boolean) =>
    referenda.sort((a, b) =>
      desc ? b.referendaId - a.referendaId : a.referendaId - b.referendaId
    );

  /// Get categorized referenda, sorted desc or asc in each category.
  const getCategorisedReferenda = (desc: boolean) => {
    const map = new Map<string, ActiveReferendaInfo[]>();

    // Insert keys into map in the desired order.
    for (const origin of getOrderedOrigins()) {
      map.set(origin, []);
    }

    // Populate map with referenda data.
    for (const info of referenda) {
      const originData = info.Ongoing.origin;
      const origin =
        'system' in originData
          ? String(originData.system)
          : String(originData.Origins);

      const state = map.get(origin) || [];
      state.push(info);
      map.set(origin, state);
    }

    // Remove keys with no referenda.
    for (const [origin, infos] of map.entries()) {
      if (!infos.length) {
        map.delete(origin);
      }
    }

    // Sort referenda in each origin according to `desc` argument.
    for (const [origin, infos] of map.entries()) {
      map.set(
        origin,
        infos.sort((a, b) =>
          desc ? b.referendaId - a.referendaId : a.referendaId - b.referendaId
        )
      );
    }

    return map;
  };

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
        getCategorisedReferenda,
      }}
    >
      {children}
    </ReferendaContext.Provider>
  );
};
