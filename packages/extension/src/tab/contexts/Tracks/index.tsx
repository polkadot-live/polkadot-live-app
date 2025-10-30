// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { useConnections } from '../../..//contexts';
import { setStateWithRef } from '@w3ux/utils';
import { getTracks, type Track } from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { TracksContextInterface } from '@polkadot-live/contexts/types/openGov';
import type { SerializedTrackItem } from '@polkadot-live/types/openGov';

export const TracksContext = createContext<TracksContextInterface | undefined>(
  undefined
);

export const useTracks = createSafeContextHook(TracksContext, 'TracksContext');

export const TracksProvider = ({ children }: { children: React.ReactNode }) => {
  const { getOnlineMode } = useConnections();

  const [tracksMap, setTracksMap] = useState(new Map<ChainID, Track[]>());
  const [fetchingTracks, setFetchingTracks] = useState<boolean>(false);
  const [activeChainId, setActiveChainId] = useState<ChainID>('Polkadot Relay');
  const activeChainIdRef = useRef<ChainID>(activeChainId);

  const handleFetchTracks = (chainId: ChainID) => {
    setFetchingTracks(true);
    chrome.runtime
      .sendMessage({
        type: 'openGov',
        task: 'fetchTracks',
        payload: { chainId },
      })
      .then((result: SerializedTrackItem[] | null) => {
        if (result !== null) {
          const parsed = getTracks(result);
          receiveTracksData(parsed, chainId);
        } else {
          // TODO: UI error notification.
          setFetchingTracks(false);
        }
      });
  };

  // Initiate fetching tracks.
  const fetchTracksData = (chainId: ChainID) => {
    if (getOnlineMode() && !tracksMap.has(chainId)) {
      handleFetchTracks(chainId);
    }
  };

  // Receive tracks from main renderer.
  const receiveTracksData = (data: Track[], chainId: ChainID) => {
    setTracksMap((pv) => pv.set(chainId, data));
    setFetchingTracks(false);
  };

  // Update active chain id.
  const updateActiveTracksChain = (chainId: ChainID) =>
    setStateWithRef(chainId, setActiveChainId, activeChainIdRef);

  // Get tracks in order for a specific chain.
  const getOrderedTracks = (chainId: ChainID) => {
    if (!tracksMap.has(chainId)) {
      return [];
    }
    return tracksMap.get(chainId)!.sort((a, b) => a.trackId - b.trackId);
  };

  // Request tracks.
  const requestTracks = (chainId: ChainID) => {
    handleFetchTracks(chainId);
  };

  return (
    <TracksContext
      value={{
        tracksMap,
        activeChainId,
        fetchingTracks,
        fetchTracksData,
        getOrderedTracks,
        receiveTracksData,
        requestTracks,
        setFetchingTracks,
        updateActiveTracksChain,
      }}
    >
      {children}
    </TracksContext>
  );
};
