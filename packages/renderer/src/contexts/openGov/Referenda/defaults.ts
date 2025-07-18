// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ReferendaContextInterface } from './types';

export const defaultReferendaContext: ReferendaContextInterface = {
  activePagedReferenda: { page: 1, pageCount: 1, referenda: [] },
  activeReferendaChainId: 'Polkadot Relay',
  fetchingReferenda: false,
  historyPagedReferenda: { page: 1, pageCount: 1, referenda: [] },
  referendaMap: new Map(),
  tabVal: 'active',
  fetchReferendaData: (c) => {},
  getActiveReferenda: (d) => [],
  getHistoryReferenda: () => [],
  getItemsPerPage: () => 1,
  getPageNumbers: () => [],
  getReferendaCount: () => 0,
  getSortedFilterOptions: () => [],
  getTrackFilter: () => null,
  receiveReferendaData: (i) => new Promise(() => {}),
  refetchReferenda: () => {},
  setFetchingReferenda: (f) => {},
  setFilterOption: () => {},
  setPage: () => {},
  setReferendaMap: () => {},
  setRefTrigger: () => {},
  setTabVal: () => {},
  showPageEllipsis: () => false,
  updateHasFetchedReferenda: () => {},
  updateTrackFilter: () => {},
};
