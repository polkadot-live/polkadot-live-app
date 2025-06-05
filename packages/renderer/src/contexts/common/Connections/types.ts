// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type * as themeVariables from '@ren/theme/variables';
import type { SyncID } from '@polkadot-live/types/communication';

export interface ConnectionsContextInterface {
  stateLoaded: boolean;
  cacheGet: (key: SyncID) => boolean;
  getTheme: () => typeof themeVariables.darkTheme;
  getOnlineMode: () => boolean;
}
