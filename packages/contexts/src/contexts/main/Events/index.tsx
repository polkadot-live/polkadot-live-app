// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getEventsAdapter } from './adapters';
import { setStateWithRef } from '@w3ux/utils';
import {
  pushUniqueEvent,
  doRemoveOutdatedEvents,
  emptyEventCounts,
} from '@polkadot-live/core';
import type { EncodedValue } from '@polkadot-live/encoder';
import type { EventsContextInterface } from '../../../types/main';
import type {
  DismissEvent,
  EventCallback,
  EventCategory,
  EventFetchCursor,
} from '@polkadot-live/types/reporter';
import { getAllEventCategories } from '@polkadot-live/consts/chains';

export const EventsContext = createContext<EventsContextInterface | undefined>(
  undefined
);

export const useEvents = createSafeContextHook(EventsContext, 'EventsContext');

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  const adapter = getEventsAdapter();

  // Events and active category.
  const [events, setEvents] = useState<EventCallback[]>([]);
  const [activeCategory, setActiveCategory] = useState<EventCategory | null>(
    null
  );
  const activeCategoryRef = useRef(activeCategory);

  // Counts by category.
  const [syncCounts, setSyncCounts] = useState(true);
  const [eventCounts, setEventCounts] =
    useState<Record<EventCategory, number>>(emptyEventCounts());

  // Event data dialog.
  const [encodedInfo, setEncodedInfo] = useState<EncodedValue[] | null>(null);
  const [dataDialogOpen, setDataDialogOpen] = useState(false);
  const [dataDialogEvent, setDataDialogEvent] = useState<EventCallback | null>(
    null
  );

  // TODO: Loading spinner.
  // Load more.
  const PAGE_SIZE = 5;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [cursor, setCursor] = useState<EventFetchCursor | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sortDesc, setSortDesc] = useState(true);
  const [loading, setLoading] = useState(false);
  const animatingCount = useRef(0);

  const startLoading = () => {
    animatingCount.current += 1;
    setLoading(true);
  };

  const finishLoading = () => {
    animatingCount.current -= 1;
    if (animatingCount.current <= 0) {
      animatingCount.current = 0;
      setLoading(false);
    }
  };

  const getEventsCount = (category?: EventCategory) =>
    category
      ? (eventCounts[category] ?? 0)
      : Object.values(eventCounts).reduce((acc, n) => acc + n, 0);

  const decCount = (event: EventCallback) => {
    setEventCounts((prev) => {
      const { category: c } = event;
      return { ...prev, [c]: Math.max((prev[c] ?? 0) - 1, 0) };
    });
  };

  const incCount = (event: EventCallback) => {
    setEventCounts((prev) => {
      const { category: c } = event;
      return { ...prev, [c]: (prev[c] ?? 0) + 1 };
    });
  };

  const addEvent = (event: EventCallback) => {
    if (event.category === activeCategoryRef.current) {
      setEvents((prev) => {
        const { updated } = pushUniqueEvent(event, prev);
        return updated ? [event, ...prev] : prev;
      });
    }
  };

  const changeActiveCategory = (category: EventCategory | null) => {
    setStateWithRef(category, setActiveCategory, activeCategoryRef);
  };

  const dismissEvent = ({ uid }: DismissEvent) => {
    setEvents((prev) => prev.filter((e) => e.uid !== uid));
  };

  const getSortedEvents = (desc = true): EventCallback[] =>
    events?.sort((a, b) =>
      desc ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    ) ?? [];

  const markStaleEvent = (uid: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.uid === uid && !e.stale ? { ...e, stale: true } : e))
    );
  };

  const removeEvent = async (event: EventCallback): Promise<void> => {
    decCount(event);
    await adapter.removeEvent(event); // Remove an event from database.
  };

  const removeOutdatedEvents = (event: EventCallback) => {
    if (event.category === activeCategory) {
      setEvents((prev) => {
        const res = doRemoveOutdatedEvents(event, prev);
        return res.updated ? res.events : prev;
      });
    }
    // Sync counts.
    setSyncCounts(true);
  };

  const setEventsState = (newEvents: EventCallback[]) => {
    // Set events (on event import).
    const filtered = newEvents.filter((e) => e.category === activeCategory);
    if (filtered.length) {
      setEvents((prev) =>
        [...prev, ...filtered].sort((a, b) => b.timestamp - a.timestamp)
      );
    }
  };

  const setRenamedEvents = (updated: EventCallback[]) => {
    // Update events with a new cached account name.
    setEvents((prev) =>
      prev.map((a) => updated.find((b) => a.uid === b.uid) ?? a)
    );
  };

  const getEventCategoryIcon = (category: EventCategory) => {
    // Get event category icon.
    switch (category) {
      case 'Balances':
        return FA.faWallet;
      case 'Nominating':
        return FA.faArrowUpRightDots;
      case 'Nomination Pools':
        return FA.faUsers;
      case 'OpenGov':
        return FA.faFileContract;
      case 'Voting':
        return FA.faCheckDouble;
      default:
        return FA.faCircleNodes;
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore || !cursor || !activeCategory) {
      return;
    }
    // Set fetched events.
    const page = await adapter.fetchEvents({
      category: activeCategory,
      limit: PAGE_SIZE,
      order: sortDesc ? 'desc' : 'asc',
      cursor,
    });
    setEvents((prev) => [...prev, ...page]);

    // Update more flag.
    if (page.length < PAGE_SIZE) {
      setHasMore(false);
    }
    // Update cursor.
    if (page.length) {
      const last = page[page.length - 1];
      setCursor({ timestamp: last.timestamp, uid: last.uid });
    }
  };

  // Sync event counts by category.
  useEffect(() => {
    const sync = async () => {
      const counts = await adapter.fetchCounts();
      setEventCounts(() => {
        const updated = emptyEventCounts();
        for (const category of getAllEventCategories()) {
          updated[category] = counts[category] ?? 0;
        }
        return updated;
      });
    };
    if (syncCounts) {
      sync();
      setSyncCounts(false);
    }
  }, [syncCounts]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '0px 0px 100px 0px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  // Re-load events when active category changes.
  useEffect(() => {
    if (!activeCategory) {
      return;
    }
    let cancelled = false;
    const loadInitial = async () => {
      setLoading(true);
      const page = await adapter.fetchEvents({
        category: activeCategory,
        limit: PAGE_SIZE,
        order: sortDesc ? 'desc' : 'asc',
      });

      if (cancelled) {
        return;
      }

      setEvents(page);
      const last = page.length ? page[page.length - 1] : null;
      setCursor(last ? { timestamp: last.timestamp, uid: last.uid } : null);
      setHasMore(page.length === PAGE_SIZE);
    };

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, sortDesc]);

  // Handle event messages.
  useEffect(() => {
    const removeListener = adapter.listenOnMount(
      markStaleEvent,
      setEventsState,
      setRenamedEvents,
      incCount,
      addEvent,
      removeOutdatedEvents
    );
    return () => {
      removeListener && removeListener();
    };
  }, []);

  return (
    <EventsContext
      value={{
        activeCategory,
        dataDialogEvent,
        dataDialogOpen,
        encodedInfo,
        eventCounts,
        hasMore,
        loadMoreRef,
        sortDesc,
        addEvent,
        changeActiveCategory,
        dismissEvent,
        finishLoading,
        getEventCategoryIcon,
        getEventsCount,
        getSortedEvents,
        markStaleEvent,
        removeEvent,
        removeOutdatedEvents,
        setDataDialogEvent,
        setDataDialogOpen,
        setEncodedInfo,
        setEventsState,
        setRenamedEvents,
        setSortDesc,
        startLoading,
      }}
    >
      {children}
    </EventsContext>
  );
};
