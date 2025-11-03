// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigOpenGov } from '@polkadot-live/core';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { useConnections } from '@ren/contexts/common';
import { usePolkassembly } from '@ren/contexts/openGov';
import { setStateWithRef } from '@w3ux/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ReferendaContextInterface } from '@polkadot-live/contexts/types/openGov';
import type {
  PagedReferenda,
  RefDeciding,
  ReferendaInfo,
  RefFilterOption,
  RefOngoing,
  RefStatus,
} from '@polkadot-live/types/openGov';

const PAGINATION_ACTIVE_ITEMS_PER_PAGE = 10;
const PAGINATION_HISTORY_ITEMS_PER_PAGE = 15;

export const ReferendaContext = createContext<
  ReferendaContextInterface | undefined
>(undefined);

export const useReferenda = createSafeContextHook(
  ReferendaContext,
  'ReferendaContext'
);

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

  // The current rendered tab.
  const [tabVal, setTabVal] = useState<'active' | 'history'>('active');

  // Chain ID for currently rendered referenda.
  const [activeReferendaChainId, setActiveReferendaChainId] =
    useState<ChainID>('Polkadot Relay');
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
      ['Polkadot Relay', null],
      ['Kusama Asset Hub', null],
    ])
  );
  const trackFilterRef = useRef(trackFilter);

  const [trackFilterTrigger, setTrackFilterTrigger] = useState<{
    trigger: boolean;
    val: string | null;
  }>({ trigger: false, val: null });

  const initStatusFilters = (tab: 'active' | 'history'): RefFilterOption[] => {
    const ongoing: RefFilterOption[] = [
      { filter: 'Confirming', label: 'Confirming', selected: true },
      { filter: 'Deciding', label: 'Deciding', selected: true },
      { filter: 'Preparing', label: 'Preparing', selected: true },
      { filter: 'Queueing', label: 'Queueing', selected: true },
    ];

    return tab === 'active'
      ? ongoing
      : ongoing.concat([
          { filter: 'Approved', label: 'Approved', selected: true },
          { filter: 'Cancelled', label: 'Cancelled', selected: true },
          { filter: 'Killed', label: 'Killed', selected: true },
          { filter: 'Rejected', label: 'Rejected', selected: true },
          { filter: 'TimedOut', label: 'Timed Out', selected: true },
        ]);
  };

  // Active referenda status filters.
  const [activeStatusFilters, setActiveStatusFilters] = useState<
    RefFilterOption[]
  >(initStatusFilters('active'));

  // History referenda status filters.
  const [historyStatusFilters, setHistoryStatusFilters] = useState<
    RefFilterOption[]
  >(initStatusFilters('history'));

  const setFilterOption = (
    tab: 'active' | 'history',
    filter: RefStatus,
    selected: boolean
  ) => {
    setPage(1, tab);

    switch (tab) {
      case 'active': {
        setActiveStatusFilters((pv) =>
          pv.map((f) => (f.filter === filter ? { ...f, selected } : f))
        );
        break;
      }
      case 'history': {
        setHistoryStatusFilters((pv) =>
          pv.map((f) => (f.filter === filter ? { ...f, selected } : f))
        );
        break;
      }
    }
  };

  const getSortedFilterOptions = (tab: 'active' | 'history') => {
    const sortFn = (a: RefFilterOption, b: RefFilterOption) =>
      a.label.localeCompare(b.label);

    switch (tab) {
      case 'active': {
        return activeStatusFilters
          .filter(({ filter }) => ongoingStatuses.includes(filter))
          .sort(sortFn);
      }
      case 'history': {
        return historyStatusFilters.sort(sortFn);
      }
    }
  };

  /**
   * Pagination state for active referenda.
   */
  const initPagedReferenda = (): PagedReferenda => ({
    page: 1,
    pageCount: 1,
    referenda: [],
  });

  const [activePagedReferenda, setActivePagedReferenda] =
    useState<PagedReferenda>(initPagedReferenda);

  const [historyPagedReferenda, setHistoryPagedReferenda] =
    useState<PagedReferenda>(initPagedReferenda);

  const setPage = (page: number, directory: 'active' | 'history') => {
    switch (directory) {
      case 'active':
        setActivePagedReferenda((pv) => ({ ...pv, page }));
        break;
      case 'history':
        setHistoryPagedReferenda((pv) => ({ ...pv, page }));
        break;
    }
  };

  const getItemsPerPage = (directory: 'active' | 'history') =>
    directory === 'active'
      ? PAGINATION_ACTIVE_ITEMS_PER_PAGE
      : PAGINATION_HISTORY_ITEMS_PER_PAGE;

  const getPageCount = useCallback(
    (directory: 'active' | 'history') => {
      const items =
        directory === 'active' ? getActiveReferenda() : getHistoryReferenda();

      const len = items ? items.length : 1;
      return Math.ceil(len / getItemsPerPage(directory));
    },
    [referendaMap, trackFilter, activeStatusFilters, historyStatusFilters]
  );

  // Get referenda data for a specific page.
  const getReferendaPage = (page: number, directory: 'active' | 'history') => {
    const itemsPerPage = getItemsPerPage(directory);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return (
      directory === 'active' ? getActiveReferenda() : getHistoryReferenda()
    ).slice(start, end);
  };

  // Get array of current pagination numbers.
  const getPageNumbers = useCallback(
    (directory: 'active' | 'history'): number[] => {
      const { page, pageCount } =
        directory === 'active' ? activePagedReferenda : historyPagedReferenda;

      if (pageCount <= 4) {
        return Array.from({ length: pageCount }, (_, i) => i + 1);
      } else {
        const start = [1, 2];
        const end = [pageCount - 1, pageCount];
        const insert = !start.includes(page) && !end.includes(page);
        return insert ? [...start, page, ...end] : [...start, ...end];
      }
    },
    [
      activePagedReferenda.page,
      activePagedReferenda.pageCount,
      historyPagedReferenda.page,
      historyPagedReferenda.pageCount,
    ]
  );

  // Controls the ellipsis box display.
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
    const map = await window.myAPI.getAppSettings();
    const flag = Boolean(map.get('setting:enable-polkassembly'));
    setUsePolkassemblyApi(flag);

    // Fetch proposal metadata if Polkassembly enabled.
    if (flag) {
      await fetchProposals(activeReferendaChainRef.current, referenda);
    }
  };

  // Get active referenda sorted from most-recent first.
  const getActiveReferenda = (other?: ReferendaInfo[]) => {
    const sortFn = (a: ReferendaInfo, b: ReferendaInfo) => b.refId - a.refId;
    const chainId = activeReferendaChainRef.current;

    // Filter active referenda based on selected track.
    const fnA = (ref: ReferendaInfo) => {
      if (!ongoingStatuses.includes(ref.refStatus)) {
        return false;
      }
      const curTrack = trackFilterRef.current.get(chainId) || null;
      const { track } = ref.info as RefOngoing;
      return curTrack === null ? true : track === curTrack;
    };

    // Filter any unselected status in the filter dropdown.
    const selected = activeStatusFilters
      .filter((f) => f.selected)
      .map((f) => f.filter);
    const fnB = (ref: ReferendaInfo) => selected.includes(ref.refStatus);

    return other
      ? other.filter(fnA).filter(fnB).sort(sortFn)
      : referendaMap.get(chainId)?.filter(fnA).filter(fnB).sort(sortFn) || [];
  };

  // Get fully sorted historical referenda.
  const getHistoryReferenda = () => {
    // Filter any unselected status in the filter dropdown.
    const selected = historyStatusFilters
      .filter((f) => f.selected)
      .map((f) => f.filter);

    return (referendaMap.get(activeReferendaChainRef.current) || [])
      .filter((r) => selected.includes(r.refStatus))
      .sort((a, b) => b.refId - a.refId);
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
        const active = getReferendaPage(activePagedReferenda.page, 'active');
        await fetchFromPolkassembly(active);
        setActivePagedReferenda((pv) => ({
          ...pv,
          pageCount: getPageCount('active'),
          referenda: active,
        }));

        // History directory.
        const history = getReferendaPage(historyPagedReferenda.page, 'history');
        await fetchFromPolkassembly(history);
        setHistoryPagedReferenda((pv) => ({
          ...pv,
          pageCount: getPageCount('history'),
          referenda: history,
        }));

        // Cleanup.
        if (fetchingReferenda) {
          setFetchingReferenda(false);
        }

        setFetchingMetadata(false);
        setRefTrigger(false);
      }
    };
    execute();
  }, [refTrigger]);

  // Trigger referenda pages when status filters change.
  useEffect(() => {
    setRefTrigger(true);
  }, [activeStatusFilters, historyStatusFilters]);

  // Fetch referenda for new page.
  useEffect(() => {
    const execute = async () => {
      const referenda = getReferendaPage(activePagedReferenda.page, 'active');
      await fetchFromPolkassembly(referenda);
      setActivePagedReferenda((pv) => ({ ...pv, referenda }));
      setFetchingMetadata(false);
    };
    execute();
  }, [activePagedReferenda.page]);

  useEffect(() => {
    const execute = async () => {
      const referenda = getReferendaPage(historyPagedReferenda.page, 'history');
      await fetchFromPolkassembly(referenda);
      setHistoryPagedReferenda((pv) => ({ ...pv, referenda }));
      setFetchingMetadata(false);
    };
    execute();
  }, [historyPagedReferenda.page]);

  // Update paged referenda when new chain selected.
  useEffect(() => {
    const execute = async () => {
      setActivePagedReferenda((pv) => ({ ...pv, page: 1 }));
      setHistoryPagedReferenda((pv) => ({ ...pv, page: 1 }));

      // Reset status filters.
      setActiveStatusFilters((pv) => pv.map((f) => ({ ...f, selected: true })));
      setHistoryStatusFilters((pv) =>
        pv.map((f) => ({ ...f, selected: true }))
      );

      setRefTrigger(true);
    };
    execute();
  }, [activeReferendaChainId]);

  return (
    <ReferendaContext
      value={{
        activePagedReferenda,
        activeReferendaChainId,
        fetchingReferenda,
        historyPagedReferenda,
        referendaMap,
        tabVal,
        fetchReferendaData,
        getActiveReferenda,
        getHistoryReferenda,
        getItemsPerPage,
        getPageNumbers,
        getSortedFilterOptions,
        getReferendaCount,
        getTrackFilter,
        receiveReferendaData,
        refetchReferenda,
        setFetchingReferenda,
        setFilterOption,
        setPage,
        setReferendaMap,
        setRefTrigger,
        setTabVal,
        showPageEllipsis,
        updateHasFetchedReferenda,
        updateTrackFilter,
      }}
    >
      {children}
    </ReferendaContext>
  );
};
