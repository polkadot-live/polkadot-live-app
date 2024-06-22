// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TracksContextInterface } from './types';

export const defaultTracksContext: TracksContextInterface = {
  tracks: [],
  fetchingTracks: false,
  activeChainId: 'Polkadot',
  fetchTracksData: (c) => {},
  receiveTracksData: (d) => {},
  setTracks: (t) => {},
  setFetchingTracks: (f) => {},
  setActiveChainId: (c) => {},
};
