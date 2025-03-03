// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { Track } from '@ren/model/Track';

export interface TracksContextInterface {
  tracks: Track[];
  activeChainId: ChainID;
  fetchingTracks: boolean;
  hasFetched: boolean;
  fetchTracksData: (chainId: ChainID) => void;
  receiveTracksData: (data: Track[]) => void;
  setTracks: (tracks: Track[]) => void;
  setFetchingTracks: (fetching: boolean) => void;
  setActiveChainId: (chainId: ChainID) => void;
  updateHasFetchedTracks: (chainId: ChainID) => void;
}
