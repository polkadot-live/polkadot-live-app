// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ReferendaContextInterface } from './types';

export const defaultReferendaContext: ReferendaContextInterface = {
  activeReferendaChainId: 'Polkadot',
  fetchingReferenda: false,
  referendaMap: new Map(),
  receiveReferendaData: (i) => new Promise(() => {}),
  fetchReferendaData: (c) => {},
  getReferendaCount: () => 0,
  refetchReferenda: () => {},
  setReferendaMap: () => {},
  setFetchingReferenda: (f) => {},
  getActiveReferenda: (d) => [],
  getTrackFilter: () => null,
  updateHasFetchedReferenda: () => {},
  updateTrackFilter: () => {},

  // new
  activePage: 1,
  activePageCount: 1,
  activePagedReferenda: [],
  showPageEllipsis: () => false,
  getPageNumbers: () => [],
  setActivePage: () => {},
  setRefTrigger: () => {},
  historyPage: 1,
  historyPageCount: 1,
  historyPagedReferenda: [],
  setHistoryPage: () => {},
  tabVal: 'active',
  setTabVal: () => {},
};
