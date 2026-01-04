// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type * as themeVariables from '@polkadot-live/styles';
import type { ActionMeta } from '@polkadot-live/types/tx';
import type { AnyData } from '@polkadot-live/types/misc';
import type { SyncID } from '@polkadot-live/types/communication';

export interface ConnectionsContextInterface {
  stateLoaded: boolean;
  cacheGet: (key: SyncID) => boolean;
  copyToClipboard: (text: string) => Promise<void>;
  getTheme: () => typeof themeVariables.darkTheme;
  getOnlineMode: () => boolean;
  grantCameraPermission: () => Promise<boolean>;
  initExtrinsicMsg: (txMeta: ActionMeta) => void;
  openInBrowser: (uri: string, analytics?: AnyData) => void;
  openTab: (
    tab: string,
    analytics?: { event: string; data: AnyData | null }
  ) => void;
  relayState: (syncId: SyncID, state: boolean | string) => void;
  umamiEvent?: (event: string, data: AnyData) => void;
}
