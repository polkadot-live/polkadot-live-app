// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getTracks } from '@polkadot-live/core';
import type { SerializedTrackItem } from '@polkadot-live/types';
import type { TracksAdapter } from './types';

export const chromeAdapter: TracksAdapter = {
  requestTracks: (chainId, setFetchingTracks, receiveTracksData) => {
    if (!receiveTracksData) {
      return;
    }

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
  },
};
