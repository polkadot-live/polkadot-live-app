// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TracksContextInterface } from './types';

export const defaultTracksContext: TracksContextInterface = {
  activeChainId: 'Polkadot Relay',
  fetchingTracks: false,
  tracksMap: new Map(),
  fetchTracksData: (c) => {},
  getOrderedTracks: () => [],
  receiveTracksData: (d) => {},
  setFetchingTracks: (f) => {},
  updateActiveTracksChain: () => {},
};
