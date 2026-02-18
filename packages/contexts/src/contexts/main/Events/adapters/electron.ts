// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@polkadot-live/core';
import type { EventsAdapter } from './types';

export const electronAdapter: EventsAdapter = {
  clearAll: async (category) => {
    try {
      const res = (await window.myAPI.sendEventTaskAsync({
        action: 'events:clearAll',
        data: { category },
      })) as boolean;
      return res;
    } catch (err) {
      console.log(err);
      return false;
    }
  },

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
        })) as string,
      );
    } catch (err) {
      console.error(err);
      return {};
    }
  },

  fetchEvents: async (payload) => {
    try {
      const fetched = (await window.myAPI.sendEventTaskAsync({
        action: 'events:fetch',
        data: { payload },
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
    removeOutdatedEvents,
  ) => {
    window.myAPI.reportNewEvent((_, event, newEvent) => {
      if (!ConfigRenderer.getAppSeting('setting:keep-outdated-events')) {
        removeOutdatedEvents(event);
      } else if (newEvent) {
        incCount(event);
      }
      addEvent(event);
    });
    window.myAPI.reportStaleEvent((_, uid: string) => {
      markStaleEvent(uid);
    });

    return null;
  },
};
