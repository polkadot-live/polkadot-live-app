// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActionMeta, AnyData, SyncID } from '@polkadot-live/types';
import type { Dispatch, RefObject, SetStateAction } from 'react';

export interface ConnectionsAdapter {
  copyToClipboard: (text: string) => Promise<void>;
  getSharedStateOnMount: () => Promise<Map<SyncID, boolean>>;
  listenSharedStateOnMount: (
    setCache: Dispatch<SetStateAction<Map<SyncID, boolean>>>,
    cacheRef: RefObject<Map<SyncID, boolean>>
  ) => (() => void) | null;
  isTabOpen: (tab: string) => Promise<boolean>;
  initAction: (txMeta: ActionMeta) => void;
  openInBrowser: (uri: string, analytics?: AnyData) => void;
  openTab: (
    tab: string,
    relayData?: AnyData,
    analytics?: {
      event: string;
      data: AnyData | null;
    }
  ) => void;
  relayState: (syncId: SyncID, state: boolean | string) => void;
  umamiEvent: (event: string, data: AnyData) => void;
}
