// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from '@polkadot-cloud/react/types';
import type { DismissEvent, EventCallback } from '@/types/reporter';
import type { ChainID } from '@/types/chains';

export interface EventsContextInterface {
  events: AnyJson;
  addEvent: (e: EventCallback) => void;
  dismissEvent: (e: DismissEvent) => void;
  sortChainEvents: (c: ChainID) => SortedChainEvents;
}

export type EventsState = Record<string, EventCallback[]>;

export type SortedChainEvents = { category: string; events: EventCallback[] }[];
