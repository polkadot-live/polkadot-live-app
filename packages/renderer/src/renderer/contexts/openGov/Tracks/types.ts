// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { Track } from '@ren/model/Track';

export interface TracksContextInterface {
  tracksMap: Map<ChainID, Track[]>;
  activeChainId: ChainID;
  fetchingTracks: boolean;
  fetchTracksData: (chainId: ChainID) => void;
  receiveTracksData: (data: Track[]) => void;
  setActiveChainId: (chainId: ChainID) => void;
  setFetchingTracks: (fetching: boolean) => void;
  setTracksMap: React.Dispatch<React.SetStateAction<Map<ChainID, Track[]>>>;
}
