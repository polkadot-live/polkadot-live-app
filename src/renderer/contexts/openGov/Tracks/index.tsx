// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { Track } from '@/model/Track';
import type { TracksContextInterface } from './types';

export const TracksContext = createContext<TracksContextInterface>(
  defaults.defaultTracksContext
);

export const useTracks = () => useContext(TracksContext);

export const TracksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);

  return (
    <TracksContext.Provider
      value={{
        tracks,
        setTracks,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};
