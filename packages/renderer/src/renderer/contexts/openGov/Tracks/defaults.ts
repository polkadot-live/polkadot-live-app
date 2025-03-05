// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TracksContextInterface } from './types';

export const defaultTracksContext: TracksContextInterface = {
  activeChainId: 'Polkadot',
  fetchingTracks: false,
  tracksMap: new Map(),
  fetchTracksData: (c) => {},
  receiveTracksData: (d) => {},
  setFetchingTracks: (f) => {},
  setActiveChainId: (c) => {},
  setTracksMap: () => {},
};
