// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson, DismissEvent, EventCallback } from '@/types';
import type { ChainID } from '@/types/chains';

export interface EventsContextInterface {
  events: AnyJson;
  addEvent: (e: EventCallback) => void;
  dismissEvent: (e: DismissEvent) => void;
  sortChainEvents: (c: ChainID) => SortedChainEvents;
}

export type EventsState = Record<string, EventCallback[]>;

export type SortedChainEvents = { category: string; events: EventCallback[] }[];
