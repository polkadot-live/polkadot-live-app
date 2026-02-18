// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Track } from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SetStateAction } from 'react';

export interface TracksAdapter {
  requestTracks: (
    chainId: ChainID,
    setFetchingTracks: (value: SetStateAction<boolean>) => void,
    receiveTracksData?: (data: Track[], chainId: ChainID) => void,
  ) => void;
}
