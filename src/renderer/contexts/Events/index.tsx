// Copyright 2023 @paritytech/polkadot-live authors & contributors
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
  const [events, setEventsState] = useState<EventsState>({});
  const eventsRef = useRef(events);

  // Set events state
  const setEvents = (newEvents: EventsState) => {
    setStateWithRef(newEvents, setEventsState, eventsRef);
  };

  // Removes an event item on a specified chain, address and event uid.
  const dismissEvent = ({ who: { chain, address }, uid }: DismissEvent) => {
    const newEvents = { ...eventsRef.current };
    const chainEvents = newEvents[chain]?.filter(
      (e) => !(e.uid === uid && e.who.address === address)
    );

    if (chainEvents) {
      newEvents[chain] = chainEvents;
    } else {
      delete newEvents[chain];
    }
    setEvents(newEvents);
  };

  // Adds an event to the events state if it is new or updates an existing event. Removes existing
  // events if they become stale.
  const addEvent = (event: EventCallback) => {
    const {
      who: { chain },
    } = event;

    // Check if this notification already exists.
    const existing = eventsRef.current[chain]?.find(
      (e) => stringifyExistentialData(e) === stringifyExistentialData(event)
    );

    let networkEvents = eventsRef.current[chain];

    // If exists but the data has changed, remove the current notification. Otherwise, return and do
    // nothing.
    if (existing) {
      if (existingEventUpdated(existing, event)) {
        networkEvents = networkEvents?.filter((e) => e.uid !== existing.uid);
      } else {
        return;
      }
    }

    // Add the event.
    if (networkEvents) {
      networkEvents.push(event);
    } else {
      networkEvents = [event];
    }

    // Persist updated chain events to state.
    setEvents(Object.assign({}, eventsRef.current, { [chain]: networkEvents }));
  };

  // Order chain evnts by category and sorts them via timestamp.
  const sortChainEvents = (chain: ChainID): SortedChainEvents => {
    if (!eventsRef.current[chain]) {
      return [];
    }
    let sortedEvents: SortedChainEvents = [];

    // Accumulate chain events by category.
    for (const event of eventsRef.current[chain]) {
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

  // Stringifies the data of an event which determines if it already exists in event state.
  const stringifyExistentialData = ({ uid, who }: EventCallback) =>
    JSON.stringify({ uid, who });

  // Checks whether the stringified data of an event has been updated from a currently stored one.
  const existingEventUpdated = (
    current: EventCallback,
    incoming: EventCallback
  ) => JSON.stringify(current.data) === JSON.stringify(incoming.data);

  return (
    <EventsContext.Provider
      value={{
        events: eventsRef.current,
        addEvent,
        dismissEvent,
        sortChainEvents,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
