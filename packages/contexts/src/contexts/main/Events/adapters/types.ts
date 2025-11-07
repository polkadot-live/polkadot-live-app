// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback } from '@polkadot-live/types';

export interface EventsAdapter {
  removeEvent: (event: EventCallback) => Promise<void>;
  listenOnMount: (
    markStaleEvent: (uid: string, chainId: ChainID) => void,
    setEvents: (newEvents: EventCallback[]) => void,
    updateEventsOnAccountRename: (
      updated: EventCallback[],
      chainId: ChainID
    ) => void
  ) => (() => void) | null;
}
