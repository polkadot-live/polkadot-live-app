// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigOpenGov } from '@ren/config/processes/openGov';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useConnections } from '@app/contexts/common/Connections';
import { usePolkassembly } from '../Polkassembly';
import { setStateWithRef } from '@w3ux/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ReferendaContextInterface } from './types';
import type {
  RefDeciding,
  ReferendaInfo,
  RefStatus,
} from '@polkadot-live/types/openGov';

const PAGINATION_ITEMS_PER_PAGE = 10;

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
  const [refTrigger, setRefTrigger] = useState(false);
  const [referendaMap, setReferendaMap] = useState(
    new Map<ChainID, ReferendaInfo[]>()
  );

  // Chain ID for currently rendered referenda.
  const [activeReferendaChainId, setActiveReferendaChainId] =
    useState<ChainID>('Polkadot');
  const activeReferendaChainRef = useRef(activeReferendaChainId);

  // Flag to indicate that referenda are being fetched.
  const [fetchingReferenda, setFetchingReferenda] = useState(false);

  const ongoingStatuses: RefStatus[] = [
    'Queueing',
    'Preparing',
    'Confirming',
    'Deciding',
  ];

  // Selected track filter.
  const [trackFilter, setTrackFilter] = useState(
    new Map<ChainID, string | null>([
      ['Polkadot', null],
      ['Kusama', null],
    ])
  );
  const trackFilterRef = useRef(trackFilter);

  const [trackFilterTrigger, setTrackFilterTrigger] = useState<{
    trigger: boolean;
    val: string | null;
  }>({ trigger: false, val: null });

  /**
   * Pagination state for active referenda.
   */
  const getActivePageCount = () => {
    const items = getSortedActiveReferenda();
    const len = items ? items.length : 1;
    return Math.ceil(len / PAGINATION_ITEMS_PER_PAGE);
  };

  const [activePage, setActivePage] = useState(1);
  const [activePageCount, setActivePageCount] = useState(1);
  const [activePagedReferenda, setActivePagedReferenda] = useState<
    ReferendaInfo[]
  >([]);

  const getActiveReferendaPage = (page: number) => {
    const items = getSortedActiveReferenda();
    const start = (page - 1) * PAGINATION_ITEMS_PER_PAGE;
    const end = start + PAGINATION_ITEMS_PER_PAGE;
    return items.slice(start, end);
  };

  // 1, 2 ... n-1, n
  const getCurPages = (): number[] => {
    const totalPages = activePageCount;

    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      const start = [activePage, activePage + 1];
      const end = [totalPages - 1, totalPages];
      return [...start, ...end];
    }
  };

  // Mechanism to update listed referenda after track filter state set.
  useEffect(() => {
    const { trigger, val } = trackFilterTrigger;
    if (trigger) {
      const newVal = trackFilter.set(
        activeReferendaChainRef.current,
        val === undefined ? null : val
      );
      setStateWithRef(newVal, setTrackFilter, trackFilterRef);
      setTrackFilterTrigger({ trigger: false, val: null });
    }
  }, [trackFilterTrigger]);

  // Fetch referenda for new page.
  useEffect(() => {
    const execute = async () => {
      const page = getActiveReferendaPage(activePage);
      await fetchFromPolkassembly(page);
      setActivePagedReferenda(page);
    };
    execute();
  }, [activePage]);

  // Triggered when a track filter is selected and when referenda are received.
  useEffect(() => {
    const execute = async () => {
      if (refTrigger) {
        const page = getActiveReferendaPage(activePage);
        await fetchFromPolkassembly(page);
        setActivePagedReferenda(page);
        setActivePageCount(getActivePageCount());
        setRefTrigger(false);
      }
    };
    execute();
  }, [refTrigger]);

  // Update paged referenda when new chain selected.
  useEffect(() => {
    const execute = async () => {
      if (referendaMap.has(activeReferendaChainRef.current)) {
        const page = getActiveReferendaPage(activePage);
        await fetchFromPolkassembly(page);
        setActivePagedReferenda(page);
        setActivePageCount(getActivePageCount());
      }
    };
    execute();
  }, [activeReferendaChainId]);

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
    const filtered = info.filter((r) => ongoingStatuses.includes(r.refStatus));
    setReferendaMap((pv) => pv.set(activeReferendaChainRef.current, filtered));
    setFetchingReferenda(false);
    setRefTrigger(true);
  };

  // Fetch paged referenda metadata if necessary.
  const fetchFromPolkassembly = async (referenda: ReferendaInfo[]) => {
    const { appEnablePolkassemblyApi } = await window.myAPI.getAppSettings();
    setUsePolkassemblyApi(appEnablePolkassemblyApi);

    // Fetch proposal metadata if Polkassembly enabled.
    if (appEnablePolkassemblyApi) {
      await fetchProposals(activeReferendaChainRef.current, referenda);
    }
  };

  // Get all referenda sorted by desc or asc.
  const getSortedActiveReferenda = (
    desc = false,
    otherReferenda?: ReferendaInfo[]
  ) => {
    const sortFn = (a: ReferendaInfo, b: ReferendaInfo) =>
      desc ? b.refId - a.refId : a.refId - b.refId;

    // Filter on status and selected track.
    const filterFn = (ref: ReferendaInfo) => {
      if (!ongoingStatuses.includes(ref.refStatus)) {
        return false;
      }

      const { track } = ref.info as RefDeciding;
      const cur =
        trackFilterRef.current.get(activeReferendaChainRef.current) || null;
      return cur === null ? true : track === cur;
    };

    if (otherReferenda) {
      return otherReferenda.filter(filterFn).sort(sortFn);
    } else {
      const referenda = referendaMap.get(activeReferendaChainRef.current);
      return referenda?.filter(filterFn).sort(sortFn) || [];
    }
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
        .filter((r) => ongoingStatuses.includes(r.refStatus))
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
        updateHasFetchedReferenda,
        updateTrackFilter,
        // new
        activePage,
        activePageCount,
        activePagedReferenda,
        getCurPages,
        setActivePage,
        setRefTrigger,
      }}
    >
      {children}
    </ReferendaContext.Provider>
  );
};
