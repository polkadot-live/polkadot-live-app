// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Track } from '@/model/Track';

export interface TracksContextInterface {
  tracks: Track[];
  fetchingTracks: boolean;
  setTracks: (tracks: Track[]) => void;
  setFetchingTracks: (fetching: boolean) => void;
}
