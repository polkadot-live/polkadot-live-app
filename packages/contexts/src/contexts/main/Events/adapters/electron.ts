// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@polkadot-live/core';
import type { EventsAdapter } from './types';
import type { EventCategory } from '@polkadot-live/types';

export const electronAdapter: EventsAdapter = {
  removeEvent: async (event) => {
    await window.myAPI.sendEventTaskAsync({
      action: 'events:remove',
      data: { event },
    });
  },

  fetchCounts: async () => {
    try {
      return JSON.parse(
        (await window.myAPI.sendEventTaskAsync({
          action: 'events:counts',
          data: null,
        })) as string
      );
    } catch (err) {
      console.error(err);
      return {};
    }
  },

  fetchEvents: async (category: EventCategory) => {
    try {
      const fetched = (await window.myAPI.sendEventTaskAsync({
        action: 'events:fetch',
        data: { category },
      })) as string;

      return JSON.parse(fetched);
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  listenOnMount: (
    markStaleEvent,
    _setEventsState,
    _setRenamedEvents,
    incCount,
    addEvent,
    removeOutdatedEvents
  ) => {
    window.myAPI.reportNewEvent((_, event, newEvent) => {
      if (!ConfigRenderer.getAppSeting('setting:keep-outdated-events')) {
        removeOutdatedEvents(event);
      } else if (newEvent) {
        incCount(event);
      }
      addEvent(event);
    });
    window.myAPI.reportStaleEvent((_, uid: string /*, chainId: ChainID*/) => {
      markStaleEvent(uid);
    });

    return null;
  },
};
