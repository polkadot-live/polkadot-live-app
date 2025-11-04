// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigOpenGov } from '@polkadot-live/core';
import type { TracksAdaptor } from './types';

export const electronAdapter: TracksAdaptor = {
  requestTracks: (chainId, setFetchingTracks) => {
    setFetchingTracks(true);
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:tracks:get',
      data: { chainId },
    });
  },
};
