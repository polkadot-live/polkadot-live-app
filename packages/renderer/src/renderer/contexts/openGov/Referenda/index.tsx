// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigOpenGov } from '@ren/config/processes/openGov';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getOrderedOrigins } from '@app/utils/openGovUtils';
import { useConnections } from '@app/contexts/common/Connections';
import { usePolkassembly } from '../Polkassembly';
import { setStateWithRef } from '@w3ux/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ReferendaContextInterface } from './types';
import type { RefDeciding, ReferendaInfo } from '@polkadot-live/types/openGov';

export const ReferendaContext = createContext<ReferendaContextInterface>(
  defaults.defaultReferendaContext
);

export const useReferenda = () => useContext(ReferendaContext);

export const ReferendaProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getOnlineMode } = useConnections();
  const { fetchProposals, setUsePolkassemblyApi } = usePolkassembly();

  // Referenda data received from API.
  const [referendaMap, setReferendaMap] = useState(
    new Map<ChainID, ReferendaInfo[]>()
  );

  // Flag to indicate that referenda are being fetched.
  const [fetchingReferenda, setFetchingReferenda] = useState(false);

  // Selected track filter.
  const [trackFilter, setTrackFilter] = useState(
    new Map<ChainID, string | null>([
      ['Polkadot', null],
      ['Kusama', null],
    ])
  );

  const [trackFilterTrigger, setTrackFilterTrigger] = useState<{
    trigger: boolean;
    val: string | null;
  }>({ trigger: false, val: null });

  // Mechanism to update listed referenda after track filter state set.
  useEffect(() => {
    const { trigger, val } = trackFilterTrigger;
    if (trigger) {
      setTrackFilter((pv) =>
        pv.set(activeReferendaChainRef.current, val === undefined ? null : val)
      );
      setTrackFilterTrigger({ trigger: false, val: null });
    }
  }, [trackFilterTrigger]);

  // Chain ID for currently rendered referenda.
  const [activeReferendaChainId, setActiveReferendaChainId] =
    useState<ChainID>('Polkadot');
  const activeReferendaChainRef = useRef(activeReferendaChainId);

  // Initiate feching referenda data.
  const fetchReferendaData = (chainId: ChainID) => {
    setStateWithRef(
      chainId,
      setActiveReferendaChainId,
      activeReferendaChainRef
    );

    // Fetch referenda if cached data doesn't exist for the chain.
    if (getOnlineMode() && !referendaMap.has(chainId)) {
      setFetchingReferenda(true);
      ConfigOpenGov.portOpenGov.postMessage({
        task: 'openGov:referenda:get',
        data: { chainId },
      });
    }
  };

  // Re-fetch referenda, called when user clicks refresh button.
  const refetchReferenda = () => {
    setFetchingReferenda(true);
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:referenda:get',
      data: { chainId: activeReferendaChainId },
    });
  };

  // Set state after receiving referenda data from main renderer.
  const receiveReferendaData = async (info: ReferendaInfo[]) => {
    /**
     * TODO: Fix
     */
    const filtered = info.filter((r) => r.refStatus === 'Deciding');
    setReferendaMap((pv) => pv.set(activeReferendaChainRef.current, filtered));

    /**
     * TODO: Fix
     * Impose limit for fetch data to avoid overhelming Polkassembly API.
     */
    // Get Polkassembly enabled setting.
    const { appEnablePolkassemblyApi } = await window.myAPI.getAppSettings();
    setUsePolkassemblyApi(appEnablePolkassemblyApi);

    // Fetch proposal metadata if Polkassembly enabled.
    if (appEnablePolkassemblyApi) {
      await fetchProposals(activeReferendaChainRef.current, filtered);
    }

    setFetchingReferenda(false);
  };

  // Get all referenda sorted by desc or asc.
  const getSortedActiveReferenda = (
    desc: boolean,
    otherReferenda?: ReferendaInfo[]
  ) => {
    /**
     * TODO: Take into account pagination.
     */
    const sortFn = (a: ReferendaInfo, b: ReferendaInfo) =>
      desc ? b.refId - a.refId : a.refId - b.refId;

    const filterFn = (ref: ReferendaInfo) => {
      if (ref.refStatus !== 'Deciding') {
        return false;
      }

      const { track } = ref.info as RefDeciding;
      const cur = trackFilter.get(activeReferendaChainRef.current) || null;
      return cur === null ? true : track === cur;
    };

    if (otherReferenda) {
      return otherReferenda.filter(filterFn).sort(sortFn);
    } else {
      const referenda = referendaMap.get(activeReferendaChainRef.current);
      return referenda?.filter(filterFn).sort(sortFn) || [];
    }
  };

  /// Get categorized referenda, sorted desc or asc in each category.
  const getCategorisedReferenda = (
    desc: boolean,
    otherReferenda?: ReferendaInfo[]
  ) => {
    const map = new Map<string, ReferendaInfo[]>();

    // Insert keys into map in the desired order.
    for (const origin of getOrderedOrigins()) {
      map.set(origin, []);
    }

    // Populate map with referenda data.
    const referenda = referendaMap.get(activeReferendaChainRef.current);
    const dataSet = otherReferenda || referenda || [];

    for (const ref of dataSet) {
      if (ref.refStatus !== 'Deciding') {
        continue;
      }

      const info = ref.info as RefDeciding;
      const originData = info.origin;
      const origin =
        'system' in originData
          ? String(originData.system)
          : String(originData.Origins);

      const state = map.get(origin) || [];
      state.push(ref);
      map.set(origin, state);
    }

    // Sort referenda in each origin according to `desc` argument.
    for (const [origin, refs] of map.entries()) {
      const filterFn = (t: ReferendaInfo) => {
        const info = t.info as RefDeciding;
        const cur = trackFilter.get(activeReferendaChainRef.current) || null;
        return cur === null ? true : info.track === cur;
      };

      map.set(
        origin,
        refs
          .filter(filterFn)
          .sort((a, b) => (desc ? b.refId - a.refId : a.refId - b.refId))
      );
    }

    // Remove keys with no referenda.
    for (const [origin, infos] of map.entries()) {
      if (!infos.length) {
        map.delete(origin);
      }
    }

    return map;
  };

  // Update the fetched flag state and ref.
  const updateHasFetchedReferenda = (chainId: ChainID) => {
    if (chainId !== activeReferendaChainId) {
      setActiveReferendaChainId(chainId);
    }
  };

  // Update track filter ref and state.
  const updateTrackFilter = (val: string | null) => {
    setTrackFilterTrigger({
      trigger: true,
      val,
    });
  };

  // Get track filter value for the active chain.
  const getTrackFilter = (): null | string =>
    trackFilter.get(activeReferendaChainRef.current) || null;

  // Get referenda count based on a target track.
  const getReferendaCount = (trackId: string | null) => {
    const referenda = referendaMap.get(activeReferendaChainRef.current);
    if (!referenda) {
      return 0;
    } else if (trackId === null) {
      return referenda.length;
    } else {
      return referenda
        .filter((r) => r.refStatus === 'Deciding')
        .filter((r) => (r.info as RefDeciding).track === trackId).length;
    }
  };

  return (
    <ReferendaContext.Provider
      value={{
        activeReferendaChainId,
        fetchingReferenda,
        referendaMap,
        getReferendaCount,
        getTrackFilter,
        fetchReferendaData,
        refetchReferenda,
        receiveReferendaData,
        setReferendaMap,
        setFetchingReferenda,
        getSortedActiveReferenda,
        getCategorisedReferenda,
        updateHasFetchedReferenda,
        updateTrackFilter,
      }}
    >
      {children}
    </ReferendaContext.Provider>
  );
};
