// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type * as themeVariables from '@polkadot-live/styles/theme/variables';
import type { AnyData } from '@polkadot-live/types/misc';
import type { SyncID } from '@polkadot-live/types/communication';

export interface ConnectionsContextInterface {
  cacheGet: (key: SyncID) => boolean;
  copyToClipboard: (text: string) => Promise<void>;
  getTheme: () => typeof themeVariables.darkTheme;
  getOnlineMode: () => boolean;
  openInBrowser: (uri: string, analytics?: AnyData) => void;
  setShared: (key: SyncID, value: boolean) => void;
}
