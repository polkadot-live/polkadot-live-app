// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SyncID } from '@polkadot-live/types/communication';

export interface ConnectionsContextInterface {
  darkMode: boolean;
  stateLoaded: boolean;
  cacheGet: (key: SyncID) => boolean;
  getOnlineMode: () => boolean;
}
