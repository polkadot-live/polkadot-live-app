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
  refetchReferenda: () => {},
  setReferendaMap: () => {},
  setFetchingReferenda: (f) => {},
  getSortedActiveReferenda: (d) => [],
  getCategorisedReferenda: (d) => new Map(),
  updateHasFetchedReferenda: () => {},
};
