// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@polkadot-cloud/utils';
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

    // Add the event and set new state.
    curEvents !== undefined ? curEvents.push(event) : (curEvents = [event]);
    cloned.set(event.who.chain, curEvents);

    setEvents(cloned);
  };

  // Order chain events by category and sorts them via timestamp.
  const sortChainEvents = (chain: ChainID): SortedChainEvents => {
    if (!eventsRef.current.has(chain)) {
      return [];
    }

    let sortedEvents: SortedChainEvents = [];

    // Accumulate chain events by category.
    for (const event of eventsRef.current.get(chain) || []) {
      const { category } = event;
      const existing = sortedEvents.find((c) => c.category === category);

      if (!existing) {
        sortedEvents.push({ category, events: [event] });
      } else {
        sortedEvents = sortedEvents?.map((c) =>
          c.category === category
            ? {
                ...c,
                events: c.events.concat(event),
              }
            : c
        );
      }
    }

    // Sort events by timestamp.
    sortedEvents = sortedEvents?.map((c) => ({
      ...c,
      events: c.events.sort((a, b) => b.timestamp - a.timestamp),
    }));
    return sortedEvents;
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
