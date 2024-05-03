// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@/types/chains';
import type { DismissEvent, EventCallback } from '@/types/reporter';

export interface EventsContextInterface {
  events: EventsState;
  addEvent: (e: EventCallback) => void;
  dismissEvent: (e: DismissEvent) => void;
  sortAllEvents: () => SortedChainEvents;
  sortChainEvents: (c: ChainID) => SortedChainEvents;
  updateEventsOnAccountRename: (e: EventCallback[], c: ChainID) => void;
  markStaleEvent: (u: string, c: ChainID) => void;
  removeOutdatedEvents: (e: EventCallback) => void;
}

export type EventsState = Map<ChainID, EventCallback[]>;

export type SortedChainEvents = Map<string, EventCallback[]>;
