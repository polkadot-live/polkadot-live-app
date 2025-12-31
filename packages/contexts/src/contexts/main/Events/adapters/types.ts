// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  EventCallback,
  EventCategory,
  EventFetchPayload,
} from '@polkadot-live/types';

export interface EventsAdapter {
  fetchCounts: () => Promise<Partial<Record<EventCategory, number>>>;
  fetchEvents: (payload: EventFetchPayload) => Promise<EventCallback[]>;
  removeEvent: (event: EventCallback) => Promise<void>;
  listenOnMount: (
    markStaleEvent: (uid: string) => void,
    setEventsState: (newEvents: EventCallback[]) => void,
    setRenamedEvents: (updated: EventCallback[]) => void,
    incCount: (event: EventCallback) => void,
    addEvent: (event: EventCallback) => void,
    removeOutdatedEvents: (event: EventCallback) => void,
    setActiveCategory: React.Dispatch<
      React.SetStateAction<EventCategory | null>
    >,
    setSyncCounts: React.Dispatch<React.SetStateAction<boolean>>
  ) => (() => void) | null;
}
