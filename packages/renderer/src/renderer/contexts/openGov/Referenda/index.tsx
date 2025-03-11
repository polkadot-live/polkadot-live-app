// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigOpenGov } from '@ren/config/processes/openGov';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useConnections } from '@app/contexts/common/Connections';
import { usePolkassembly } from '../Polkassembly';
import { setStateWithRef } from '@w3ux/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ReferendaContextInterface } from './types';
import type {
  RefDeciding,
  ReferendaInfo,
  RefOngoing,
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
  const {
    clearProposals,
    fetchProposals,
    setUsePolkassemblyApi,
    setFetchingMetadata,
  } = usePolkassembly();

  // Referenda data received from API.
  const [refTrigger, setRefTrigger] = useState(false);
  const [referendaMap, setReferendaMap] = useState(
    new Map<ChainID, ReferendaInfo[]>()
  );

  const [tabVal, setTabVal] = useState<'active' | 'history'>('active');

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
  const getPageCount = useCallback(
    (directory: 'active' | 'history') => {
      const items =
        directory === 'active' ? getActiveReferenda() : getHistoryReferenda();

      const len = items ? items.length : 1;
      return Math.ceil(len / PAGINATION_ITEMS_PER_PAGE);
    },
    [referendaMap, trackFilter]
  );

  // Active referenda directory.
  const [activePage, setActivePage] = useState(1);
  const [activePageCount, setActivePageCount] = useState(1);
  const [activePagedReferenda, setActivePagedReferenda] = useState<
    ReferendaInfo[]
  >([]);

  // History referenda directory.
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageCount, setHistoryPageCount] = useState(1);
  const [historyPagedReferenda, setHistoryPagedReferenda] = useState<
    ReferendaInfo[]
  >([]);

  // Get referenda data for a specific page.
  const getReferendaPage = (page: number, directory: 'active' | 'history') => {
    const start = (page - 1) * PAGINATION_ITEMS_PER_PAGE;
    const end = start + PAGINATION_ITEMS_PER_PAGE;
    return (
      directory === 'active' ? getActiveReferenda() : getHistoryReferenda()
    ).slice(start, end);
  };

  // Get array of current pagination numbers.
  const getPageNumbers = useCallback(
    (directory: 'active' | 'history'): number[] => {
      const cur = directory === 'active' ? activePage : historyPage;
      const count = directory === 'active' ? activePageCount : historyPageCount;

      if (count <= 4) {
        return Array.from({ length: count }, (_, i) => i + 1);
      } else {
        const start = [1, 2];
        const end = [count - 1, count];
        const insert = !start.includes(cur) && !end.includes(cur);
        return insert ? [...start, cur, ...end] : [...start, ...end];
      }
    },
    [activePage, historyPage, activePageCount, historyPageCount]
  );

  const showPageEllipsis = (directory: 'active' | 'history') =>
    getPageNumbers(directory).length === 5;

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
    clearProposals(activeReferendaChainId);
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:referenda:get',
      data: { chainId: activeReferendaChainId },
    });
  };

  // Set state after receiving referenda data from main renderer.
  const receiveReferendaData = async (info: ReferendaInfo[]) => {
    setReferendaMap((pv) => pv.set(activeReferendaChainRef.current, info));
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

  // Get active referenda sorted from most-recent first.
  const getActiveReferenda = (other?: ReferendaInfo[]) => {
    const sortFn = (a: ReferendaInfo, b: ReferendaInfo) => b.refId - a.refId;
    const chainId = activeReferendaChainRef.current;

    // Filter active referenda on status and selected track.
    const filterFn = (ref: ReferendaInfo) => {
      if (!ongoingStatuses.includes(ref.refStatus)) {
        return false;
      }
      const curTrack = trackFilterRef.current.get(chainId) || null;
      const { track } = ref.info as RefOngoing;
      return curTrack === null ? true : track === curTrack;
    };

    return other
      ? other.filter(filterFn).sort(sortFn)
      : referendaMap.get(chainId)?.filter(filterFn).sort(sortFn) || [];
  };

  // Get fully sorted historical referenda.
  const getHistoryReferenda = () => {
    const chainId = activeReferendaChainRef.current;
    return referendaMap.get(chainId)?.sort((a, b) => b.refId - a.refId) || [];
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
      return referenda.filter((r) => ongoingStatuses.includes(r.refStatus))
        .length;
    } else {
      return referenda
        .filter((r) => ongoingStatuses.includes(r.refStatus))
        .filter((r) => (r.info as RefDeciding).track === trackId).length;
    }
  };

  // Mechanism to update active referenda after track filter state set.
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

  // Triggered when a track filter is selected and when referenda are received.
  useEffect(() => {
    const execute = async () => {
      if (refTrigger) {
        // Active directory.
        const pActive = getReferendaPage(activePage, 'active');
        await fetchFromPolkassembly(pActive);
        setActivePagedReferenda(pActive);
        setActivePageCount(getPageCount('active'));

        // History directory.
        const pHistory = getReferendaPage(historyPage, 'history');
        await fetchFromPolkassembly(pHistory);
        setHistoryPagedReferenda(pHistory);
        setHistoryPageCount(getPageCount('history'));

        if (fetchingReferenda) {
          setFetchingReferenda(false);
        }

        setFetchingMetadata(false);
        setRefTrigger(false);
      }
    };
    execute();
  }, [refTrigger]);

  // Fetch referenda for new page.
  useEffect(() => {
    const execute = async () => {
      const page = getReferendaPage(activePage, 'active');
      await fetchFromPolkassembly(page);
      setActivePagedReferenda(page);
      setFetchingMetadata(false);
    };
    execute();
  }, [activePage]);

  useEffect(() => {
    const execute = async () => {
      const page = getReferendaPage(historyPage, 'history');
      await fetchFromPolkassembly(page);
      setHistoryPagedReferenda(page);
      setFetchingMetadata(false);
    };
    execute();
  }, [historyPage]);

  // Update paged referenda when new chain selected.
  useEffect(() => {
    const execute = async () => {
      setActivePage(1);
      setHistoryPage(1);
      setRefTrigger(true);
    };
    execute();
  }, [activeReferendaChainId]);

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
        getActiveReferenda,
        updateHasFetchedReferenda,
        updateTrackFilter,
        // new
        activePage,
        activePageCount,
        activePagedReferenda,
        showPageEllipsis,
        getPageNumbers,
        setActivePage,
        setRefTrigger,
        historyPage,
        historyPageCount,
        historyPagedReferenda,
        setHistoryPage,
        tabVal,
        setTabVal,
      }}
    >
      {children}
    </ReferendaContext.Provider>
  );
};
