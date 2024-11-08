// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { createContext, useContext, useRef, useState } from 'react';
import { useConnections } from '../../common/Connections';
import type { ChainID } from '@/types/chains';
import type { Track } from '@/model/Track';
import type { TracksContextInterface } from './types';

export const TracksContext = createContext<TracksContextInterface>(
  defaults.defaultTracksContext
);

export const useTracks = () => useContext(TracksContext);

export const TracksProvider = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useConnections();

  /// Track data received from API.
  const [tracks, setTracks] = useState<Track[]>([]);
  /// Flag to indicate tracks are being fetched.
  const [fetchingTracks, setFetchingTracks] = useState<boolean>(false);
  /// Chain ID for currently rendered tracks.
  const [activeChainId, setActiveChainId] = useState<ChainID>('Polkadot');

  /// Ref to indicate if data has been fetched and cached.
  const dataCachedRef = useRef(false);

  /// Initiate fetching tracks.
  const fetchTracksData = (chainId: ChainID) => {
    if (isConnected && (!dataCachedRef.current || activeChainId !== chainId)) {
      setActiveChainId(chainId);
      setFetchingTracks(true);

      ConfigOpenGov.portOpenGov.postMessage({
        task: 'openGov:tracks:get',
        data: {
          chainId,
        },
      });
    }
  };

  /// Receive tracks from main renderer.
  const receiveTracksData = (data: Track[]) => {
    setTracks(data);
    setFetchingTracks(false);
    dataCachedRef.current = true;
  };

  return (
    <TracksContext.Provider
      value={{
        tracks,
        fetchingTracks,
        activeChainId,
        fetchTracksData,
        receiveTracksData,
        setTracks,
        setFetchingTracks,
        setActiveChainId,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};
