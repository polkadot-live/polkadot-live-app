// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { createContext, useContext, useRef, useState } from 'react';
import { getOrderedOrigins } from '@/renderer/utils/openGovUtils';
import { useConnections } from '@app/contexts/common/Connections';
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
  const { isConnected } = useConnections();

  /// Ref to indiciate if referenda data has been fetched.
  const dataCachedRef = useRef(false);

  /// Referenda data received from API.
  const [referenda, setReferenda] = useState<ActiveReferendaInfo[]>([]);

  /// Flag to indicate that referenda is being fetched.
  const [fetchingReferenda, setFetchingReferenda] = useState(false);

  /// Chain ID for currently rendered referenda.
  const [activeReferendaChainId, setActiveReferendaChainId] =
    useState<ChainID>('Polkadot');

  /// Initiate feching referenda data.
  const fetchReferendaData = (chainId: ChainID) => {
    // Return early if offline or data is already fetched for the chain.
    if (
      !isConnected ||
      (dataCachedRef.current && chainId === activeReferendaChainId)
    ) {
      return;
    }

    setActiveReferendaChainId(chainId);
    setFetchingReferenda(true);

    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:referenda:get',
      data: { chainId },
    });
  };

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

  /// Setter for data cached ref.
  const setDataCached = (cached: boolean) => (dataCachedRef.current = cached);

  return (
    <ReferendaContext.Provider
      value={{
        referenda,
        fetchingReferenda,
        activeReferendaChainId,
        setDataCached,
        fetchReferendaData,
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
