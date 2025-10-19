// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import {
  pushUniqueEvent,
  getEventChainId,
  doRemoveOutdatedEvents,
} from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  DismissEvent,
  EventCallback,
} from '@polkadot-live/types/reporter';
import type {
  EventsContextInterface,
  EventsState,
  SortedChainEvents,
} from '@polkadot-live/contexts/types/main';

export const EventsContext = createContext<EventsContextInterface | undefined>(
  undefined
);

export const useEvents = createSafeContextHook(EventsContext, 'EventsContext');

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  /// Store the currently imported events
  const [events, setEventsState] = useState<EventsState>(new Map());

  /// Set events (on event import).
  const setEvents = (newEvents: EventCallback[]) => {
    const map: EventsState = new Map();

    for (const event of newEvents) {
      const chainId = getEventChainId(event);
      map.has(chainId)
        ? map.set(chainId, [...map.get(chainId)!, event])
        : map.set(chainId, [event]);
    }

    setEventsState(map);
  };

  /// Remove event from database.
  const removeEvent = async (event: EventCallback): Promise<void> => {
    await window.myAPI.sendEventTaskAsync({
      action: 'events:remove',
      data: { event },
    });
  };

  /// Removes an event item on a specified chain; compares event uid.
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

  /// Remove any outdated events in the state.
  const removeOutdatedEvents = (event: EventCallback) => {
    setEventsState((prev) => {
      const cloned = new Map(prev);
      const chainId = getEventChainId(event);

      const all = cloned.get(chainId);
      if (!all) {
        return cloned;
      }

      const { updated, events: newEvents } = doRemoveOutdatedEvents(event, all);
      if (updated) {
        cloned.set(chainId, newEvents);
      }

      return cloned;
    });
  };

  /// Adds an event to the events state.
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

  /// Mark an event as stale.
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

  /// Sort all events timestamp order.
  const sortAllEvents = (newestFirst: boolean): EventCallback[] => {
    const allEvents: EventCallback[] = [];

    // Populare all events array.
    for (const chainEvents of events.values()) {
      chainEvents.forEach((e) => allEvents.push({ ...e }));
    }

    // Sort the events based on `newestFirst` argument.
    return newestFirst
      ? allEvents.sort((x, y) => y.timestamp - x.timestamp)
      : allEvents.sort((x, y) => x.timestamp - y.timestamp);
  };

  /// Sort all events into categories in timestamp order.
  const sortAllGroupedEvents = (newestFirst: boolean): SortedChainEvents => {
    const sortedMap = new Map<string, EventCallback[]>();

    // Get all categories and sort alphabetically.
    const categories = new Set<string>();
    for (const chainEvents of events.values()) {
      chainEvents.forEach((e) => categories.add(e.category));
    }

    // Initialize sorted map with ordered categories.
    Array.from(categories)
      .sort((x, y) => x.localeCompare(y))
      .forEach((c) => sortedMap.set(c, []));

    // Categorize events.
    for (const chainEvents of events.values()) {
      for (const event of chainEvents) {
        const { category } = event;

        sortedMap.has(category)
          ? sortedMap.set(category, [...sortedMap.get(category)!, event])
          : sortedMap.set(category, [event]);
      }
    }

    // Sort events by timestamp descending or ascending in each category.
    for (const [category, categoryEvents] of sortedMap.entries()) {
      sortedMap.set(
        category,
        categoryEvents.sort((x, y) =>
          newestFirst ? y.timestamp - x.timestamp : x.timestamp - y.timestamp
        )
      );
    }

    return sortedMap;
  };

  /// Order chain events by category and sort them via timestamp.
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

  /// Update events with a new cached account name.
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

  /// Get event count.
  const getEventsCount = (category?: string) =>
    events.size == 0
      ? 0
      : category === undefined
        ? [...sortAllGroupedEvents(true).values()].reduce(
            (acc, es) => acc + es.length,
            0
          )
        : sortAllGroupedEvents(true).get(category)?.length || 0;

  /// Get readable event category.
  const getReadableEventCategory = (category: string) => {
    // 'balances', 'nominationPools', 'nominating', 'openGov'
    switch (category) {
      case 'balances': {
        return 'Balances';
      }
      case 'nominationPools': {
        return 'Pools';
      }
      case 'nominating': {
        return 'Nominating';
      }
      case 'openGov': {
        return 'OpenGov';
      }
      default: {
        return 'Unknown';
      }
    }
  };

  /// Get array of all encoded event categories.
  const getAllEventCategoryKeys = (): string[] => [
    'balances',
    'nominationPools',
    'nominating',
    'openGov',
  ];

  return (
    <EventsContext
      value={{
        events,
        addEvent,
        setEvents,
        dismissEvent,
        sortAllEvents,
        sortAllGroupedEvents,
        sortChainEvents,
        updateEventsOnAccountRename,
        markStaleEvent,
        removeOutdatedEvents,
        getEventsCount,
        getReadableEventCategory,
        getAllEventCategoryKeys,
        removeEvent,
      }}
    >
      {children}
    </EventsContext>
  );
};
