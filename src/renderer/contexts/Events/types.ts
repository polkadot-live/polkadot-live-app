// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type { DismissEvent, EventCallback } from '@/types/reporter';

export interface EventsContextInterface {
  events: EventsState;
  eventsRef: AnyData;
  addEvent: (e: EventCallback) => void;
  dismissEvent: (e: DismissEvent) => void;
  sortChainEvents: (c: ChainID) => SortedChainEvents;
}

export type EventsState = Map<ChainID, EventCallback[]>;

export type SortedChainEvents = Map<string, EventCallback[]>;
