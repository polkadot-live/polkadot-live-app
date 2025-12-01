// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type {
  DismissEvent,
  EventCallback,
} from '@polkadot-live/types/reporter';

export interface EventsContextInterface {
  events: EventsState;
  setEvents: (events: EventCallback[]) => void;
  addEvent: (e: EventCallback) => void;
  dismissEvent: (e: DismissEvent) => void;
  sortAllEvents: (newestFirst: boolean) => EventCallback[];
  sortAllGroupedEvents: (newestFirst: boolean) => SortedChainEvents;
  sortChainEvents: (c: ChainID) => SortedChainEvents;
  updateEventsOnAccountRename: (e: EventCallback[], c: ChainID) => void;
  markStaleEvent: (u: string, c: ChainID) => void;
  removeOutdatedEvents: (e: EventCallback) => void;
  getEventsCount: (category?: string) => number;
  getAllEventCategoryKeys: () => string[];
  removeEvent: (event: EventCallback) => Promise<void>;
}

export type EventsState = Map<ChainID, EventCallback[]>;

export type SortedChainEvents = Map<string, EventCallback[]>;
