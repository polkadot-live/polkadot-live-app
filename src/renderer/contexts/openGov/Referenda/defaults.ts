// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ReferendaContextInterface } from './types';

export const defaultReferendaContext: ReferendaContextInterface = {
  referenda: [],
  fetchingReferenda: false,
  activeReferendaChainId: 'Polkadot',
  receiveReferendaData: (i) => new Promise(() => {}),
  fetchReferendaData: (c) => {},
  refetchReferenda: () => {},
  setReferenda: (r) => {},
  setFetchingReferenda: (f) => {},
  getSortedActiveReferenda: (d) => [],
  getCategorisedReferenda: (d) => new Map(),
};
