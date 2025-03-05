// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigOpenGov } from '@ren/config/processes/openGov';
import { createContext, useContext, useRef, useState } from 'react';
import { useConnections } from '../../common/Connections';
import type { ChainID } from '@polkadot-live/types/chains';
import type { Track } from '@ren/model/Track';
import type { TracksContextInterface } from './types';
import { setStateWithRef } from '@w3ux/utils';

export const TracksContext = createContext<TracksContextInterface>(
  defaults.defaultTracksContext
);

export const useTracks = () => useContext(TracksContext);

export const TracksProvider = ({ children }: { children: React.ReactNode }) => {
  const { getOnlineMode } = useConnections();

  const [tracksMap, setTracksMap] = useState(new Map<ChainID, Track[]>());
  const [fetchingTracks, setFetchingTracks] = useState<boolean>(false);
  const [activeChainId, setActiveChainId] = useState<ChainID>('Polkadot');
  const activeChainIdRef = useRef<ChainID>(activeChainId);

  // Initiate fetching tracks.
  const fetchTracksData = (chainId: ChainID) => {
    setStateWithRef(chainId, setActiveChainId, activeChainIdRef);

    if (getOnlineMode() && !tracksMap.has(chainId)) {
      setFetchingTracks(true);
      ConfigOpenGov.portOpenGov.postMessage({
        task: 'openGov:tracks:get',
        data: {
          chainId,
        },
      });
    }
  };

  // Receive tracks from main renderer.
  const receiveTracksData = (data: Track[]) => {
    setFetchingTracks(false);
    setTracksMap((pv) => pv.set(activeChainIdRef.current, data));
  };

  return (
    <TracksContext.Provider
      value={{
        tracksMap,
        activeChainId,
        fetchingTracks,
        fetchTracksData,
        receiveTracksData,
        setTracksMap,
        setFetchingTracks,
        setActiveChainId,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};
