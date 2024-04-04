// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useContext, useState } from 'react';
import { pushUniqueEvent, getEventChainId } from '@/utils/EventUtils';
import * as defaults from './defaults';
import type { ChainID } from '@/types/chains';
import type { DismissEvent, EventCallback } from '@/types/reporter';
import type {
  EventsContextInterface,
  EventsState,
  SortedChainEvents,
} from './types';

export const EventsContext = createContext<EventsContextInterface>(
  defaults.defaultEventsContext
);

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  // Store the currently imported events
  const [events, setEventsState] = useState<EventsState>(new Map());

  // Removes an event item on a specified chain; compares event uid.
  const dismissEvent = ({ who: { data }, uid }: DismissEvent) => {
    setEventsState((prev) => {
      const cloned: EventsState = new Map(prev);
      const chainId = data.chainId;
      const filtered = cloned.get(chainId)?.filter((e) => !(e.uid === uid));

      filtered && filtered.length > 0
        ? cloned.set(chainId, filtered)
        : cloned.has(chainId) && cloned.delete(chainId);

      return cloned;
    });
  };

  // Adds an event to the events state.
  const addEvent = (event: EventCallback) => {
    setEventsState((prev) => {
      const cloned = new Map(prev);
      const chainId = getEventChainId(event);
      let curEvents = cloned.get(chainId);

      if (curEvents !== undefined) {
        const { events: newEvents } = pushUniqueEvent(event, curEvents);
        curEvents = newEvents;
      } else {
        curEvents = [event];
      }

      cloned.set(chainId, curEvents);
      return cloned;
    });
  };

  // Mark an event as stale.
  const markStaleEvent = (uid: string, chainId: ChainID) => {
    setEventsState((prev) => {
      const cloned = new Map(prev);
      let curEvents = cloned.get(chainId);

      if (!curEvents) {
        return cloned;
      }

      curEvents = curEvents.map((e) => {
        e.uid === uid && (e.stale = true);
        return e;
      });

      cloned.set(chainId, curEvents);
      return cloned;
    });
  };

  // Order chain events by category and sorts them via timestamp.
  const sortChainEvents = (chain: ChainID): SortedChainEvents => {
    if (!events.has(chain)) {
      return new Map();
    }

    // Get all events for the chain ID.
    const cloned = new Map(events);
    const allEvents = cloned.get(chain)!;

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

  // Update events with a new cached account name.
  const updateEventsOnAccountRename = (
    updated: EventCallback[],
    chainId: ChainID
  ) => {
    setEventsState((prev) => {
      const cloned = new Map(prev);
      let curEvents = cloned.get(chainId);

      if (curEvents !== undefined) {
        for (const event of updated) {
          curEvents = curEvents.map((e) => (e.uid === event.uid ? event : e));
        }
        cloned.set(chainId, curEvents);
        return cloned;
      } else {
        return prev;
      }
    });
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        addEvent,
        dismissEvent,
        sortChainEvents,
        updateEventsOnAccountRename,
        markStaleEvent,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
