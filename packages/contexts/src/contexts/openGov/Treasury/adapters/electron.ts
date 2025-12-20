// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigTabs } from '@polkadot-live/core';
import type { TreasuryAdapter } from './types';

export const electronAdapter: TreasuryAdapter = {
  initTreasury: (chainId, setFetchingTreasuryData) => {
    setFetchingTreasuryData(true);
    ConfigTabs.portToMain.postMessage({
      task: 'openGov:treasury:init',
      data: { chainId },
    });
  },
};
