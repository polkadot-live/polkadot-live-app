// Copyright 2023 @paritytech/polkadot-live authors & contributors

import { AnyJson, DismissEvent, EventCallback } from '@polkadot-live/types';
import { ChainID } from '@polkadot-live/types/chains';

export interface EventsContextInterface {
  events: AnyJson;
  addEvent: (e: EventCallback) => void;
  dismissEvent: (e: DismissEvent) => void;
  sortChainEvents: (c: ChainID) => SortedChainEvents;
}

export type EventsState = { [key: string]: EventCallback[] };

export type SortedChainEvents = { category: string; events: EventCallback[] }[];
