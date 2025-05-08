// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { Track } from '@core/model';

export interface TracksContextInterface {
  tracksMap: Map<ChainID, Track[]>;
  activeChainId: ChainID;
  fetchingTracks: boolean;
  fetchTracksData: (chainId: ChainID) => void;
  getOrderedTracks: (chainId: ChainID) => Track[];
  receiveTracksData: (data: Track[], chainId: ChainID) => void;
  setFetchingTracks: (fetching: boolean) => void;
  updateActiveTracksChain: (chainId: ChainID) => void;
}
