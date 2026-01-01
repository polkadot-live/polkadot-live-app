// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { EventsAdapter } from './types';
import type { EventCallback } from '@polkadot-live/types';

export const chromeAdapter: EventsAdapter = {
  clearAll: async (category) => {
    try {
      const msg = { type: 'events', task: 'clearAll', payload: { category } };
      return await chrome.runtime.sendMessage(msg);
    } catch (err) {
      console.log(err);
      return false;
    }
  },

  fetchCounts: async () => {
    try {
      const msg = { type: 'events', task: 'getCounts' };
      return await chrome.runtime.sendMessage(msg);
    } catch (err) {
      console.error(err);
      return {};
    }
  },

  fetchEvents: async (payload) => {
    try {
      const msg = { type: 'events', task: 'getEvents', payload: { payload } };
      return await chrome.runtime.sendMessage(msg);
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  removeEvent: async (event) => {
    const msg = { type: 'events', task: 'remove', payload: { event } };
    await chrome.runtime.sendMessage(msg);
  },

  listenOnMount: (
    markStaleEvent,
    setEventsState,
    setRenamedEvents,
    incCount,
    addEvent,
    removeOutdatedEvents,
    setActiveCategory,
    setSyncCounts
  ) => {
    const callback = (message: AnyData) => {
      if (message.type == 'events') {
        switch (message.task) {
          case 'addEvent': {
            interface I {
              event: EventCallback;
              handleOutdated: boolean;
            }
            const { event, handleOutdated }: I = message.payload;
            handleOutdated ? removeOutdatedEvents(event) : incCount(event);
            addEvent(event);
            break;
          }
          case 'setEventsState': {
            const { result }: { result: EventCallback[] } = message.payload;
            setEventsState(result);
            setActiveCategory(null);
            setSyncCounts(true);
            break;
          }
          case 'updateAccountNames': {
            const { updated }: { updated: EventCallback[] } = message.payload;
            updated.length > 0 && setRenamedEvents(updated);
            break;
          }
          case 'staleEvent': {
            const { uid }: { uid: string } = message.payload;
            markStaleEvent(uid);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },
};
