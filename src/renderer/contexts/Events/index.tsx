// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import React, { createContext, useContext, useRef, useState } from 'react';
import * as defaults from './defaults';
import type {
  EventsContextInterface,
  EventsState,
  SortedChainEvents,
} from './types';
import type { ChainID } from '@/types/chains';
import type { DismissEvent, EventCallback } from '@/types/reporter';

export const EventsContext = createContext<EventsContextInterface>(
  defaults.defaultEventsContext
);
import { pushEventAndFilterDuplicates } from '@/utils/EventUtils';

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  // Store the currently imported events
  const [events, setEventsState] = useState<EventsState>(new Map());
  const eventsRef = useRef(events);

  // Set events state
  const setEvents = (newEvents: EventsState) => {
    setStateWithRef(newEvents, setEventsState, eventsRef);
  };

  // Removes an event item on a specified chain; compares address and event uid.
  const dismissEvent = ({ who: { chain, address }, uid }: DismissEvent) => {
    const cloned: EventsState = new Map(eventsRef.current);

    const filtered = cloned
      .get(chain)
      ?.filter((e) => !(e.uid === uid && e.who.address === address));

    filtered && filtered.length > 0
      ? cloned.set(chain, filtered)
      : cloned.has(chain) && cloned.delete(chain);

    setEvents(cloned);
  };

  // Adds an event to the events state.
  const addEvent = (event: EventCallback) => {
    const cloned = new Map(eventsRef.current);
    let curEvents = cloned.get(event.who.chain);

    // Filter any duplicate events from current events array.
    curEvents !== undefined
      ? (curEvents = pushEventAndFilterDuplicates(event, curEvents))
      : (curEvents = [event]);

    // Add the event and set new state.
    cloned.set(event.who.chain, curEvents);

    setEvents(cloned);
  };

  // Order chain events by category and sorts them via timestamp.
  const sortChainEvents = (chain: ChainID): SortedChainEvents => {
    if (!eventsRef.current.has(chain)) {
      return new Map();
    }

    // Get all events for the chain ID.
    const allEvents = eventsRef.current.get(chain)!;

    // Store events by category.
    const sortedMap = new Map<string, EventCallback[]>();

    for (const event of allEvents) {
      const { category } = event;
      const current = sortedMap.get(category)!;

      sortedMap.has(event.category)
        ? sortedMap.set(category, [...current, event])
        : sortedMap.set(category, [event]);
    }

    // Sort events by timestamp.
    for (const category of Array.from(sortedMap.keys())) {
      const sorted = sortedMap
        .get(category)!
        .sort((x, y) => y.timestamp - x.timestamp);

      sortedMap.set(category, sorted);
    }

    return sortedMap;
  };

  return (
    <EventsContext.Provider
      value={{
        // NOTE: Could pass both state and ref props
        events,
        addEvent,
        dismissEvent,
        sortChainEvents,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
