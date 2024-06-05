// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TracksContextInterface } from './types';

export const defaultTracksContext: TracksContextInterface = {
  tracks: [],
  fetchingTracks: false,
  activeChainId: 'Polkadot',
  setTracks: (t) => {},
  setFetchingTracks: (f) => {},
  setActiveChainId: (c) => {},
  setDataCached: (c) => {},
  getDataCached: () => false,
};
