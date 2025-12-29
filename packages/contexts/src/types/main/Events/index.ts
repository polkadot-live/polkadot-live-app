// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { EncodedValue } from '@polkadot-live/encoder';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type {
  DismissEvent,
  EventCallback,
  EventCategory,
} from '@polkadot-live/types/reporter';

export interface EventsContextInterface {
  activeCategory: EventCategory | null;
  dataDialogEvent: EventCallback | null;
  dataDialogOpen: boolean;
  encodedInfo: EncodedValue[] | null;
  eventCounts: Record<EventCategory, number>;
  addEvent: (e: EventCallback) => void;
  changeActiveCategory: (category: EventCategory | null) => void;
  dismissEvent: (e: DismissEvent) => void;
  getEventCategoryIcon: (category: EventCategory) => IconDefinition;
  getEventsCount: (category?: EventCategory) => number;
  getSortedEvents: (desc?: boolean) => EventCallback[];
  markStaleEvent: (u: string, c: ChainID) => void;
  removeEvent: (event: EventCallback) => Promise<void>;
  removeOutdatedEvents: (e: EventCallback) => void;
  setDataDialogEvent: React.Dispatch<
    React.SetStateAction<EventCallback | null>
  >;
  setDataDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEncodedInfo: React.Dispatch<React.SetStateAction<EncodedValue[] | null>>;
  setEventsState: (events: EventCallback[]) => void;
  setRenamedEvents: (e: EventCallback[]) => void;
}
