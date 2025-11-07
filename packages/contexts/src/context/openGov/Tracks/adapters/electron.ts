// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigOpenGov } from '@polkadot-live/core';
import type { TracksAdapter } from './types';

export const electronAdapter: TracksAdapter = {
  requestTracks: (chainId, setFetchingTracks) => {
    setFetchingTracks(true);
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:tracks:get',
      data: { chainId },
    });
  },
};
