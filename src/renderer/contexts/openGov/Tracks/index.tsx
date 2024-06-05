// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useRef, useState } from 'react';
import type { ChainID } from '@/types/chains';
import type { Track } from '@/model/Track';
import type { TracksContextInterface } from './types';

export const TracksContext = createContext<TracksContextInterface>(
  defaults.defaultTracksContext
);

export const useTracks = () => useContext(TracksContext);

export const TracksProvider = ({ children }: { children: React.ReactNode }) => {
  /// Track data received from API.
  const [tracks, setTracks] = useState<Track[]>([]);
  /// Flag to indicate tracks are being fetched.
  const [fetchingTracks, setFetchingTracks] = useState<boolean>(false);
  /// Chain ID for currently rendered tracks.
  const [activeChainId, setActiveChainId] = useState<ChainID>('Polkadot');

  /// Ref to indicate if data has been fetched and cached.
  const dataCachedRef = useRef(false);

  /// Accessors for for cached ref.
  const getDataCached = (): boolean => dataCachedRef.current;

  const setDataCached = (cached: boolean) => {
    dataCachedRef.current = cached;
  };

  return (
    <TracksContext.Provider
      value={{
        tracks,
        fetchingTracks,
        activeChainId,
        setTracks,
        setFetchingTracks,
        setActiveChainId,
        getDataCached,
        setDataCached,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};
