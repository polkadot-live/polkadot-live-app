// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigOpenGov } from '@polkadot-live/core';
import type { TreasuryAdaptor } from './types';

export const electronAdapter: TreasuryAdaptor = {
  initTreasury: (chainId, setFetchingTreasuryData) => {
    setFetchingTreasuryData(true);
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:treasury:init',
      data: { chainId },
    });
  },
};
