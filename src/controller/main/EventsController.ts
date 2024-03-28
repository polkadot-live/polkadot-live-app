// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getUid } from '@/utils/CryptoUtils';
import { MainDebug } from '@/utils/DebugUtils';
import { pushUniqueEvent } from '@/utils/EventUtils';
import { store } from '@/main';
import { WindowsController } from '@/controller/main/WindowsController';
import type { AnyJson } from '@w3ux/utils/types';
import type { EventAccountData, EventCallback } from '@/types/reporter';

const debug = MainDebug.extend('EventsController');

export class EventsController {
  private static storeKey = 'persisted_events';

  /**
   * Set to `true` when app initializes and persisted events
   * are sent to the renderer.
   */
  private static isInitialized = false;

  /**
   * @name initialize
   * @summary Fetch persisted events from store and send to frontend.
   */
  static initialize() {
    if (EventsController.isInitialized) {
      return;
    }

    // Set toggle to indicate stored events have been sent to renderer.
    EventsController.isInitialized = true;

    // Fetch events from store and send them to renderer.
    const events = EventsController.getEventsFromStore();

    // Return if no events are stored.
    if (events.length === 0) {
      return;
    }

    // TODO: Put in utils file to decouple WindowsController, and return `events`.
    for (const event of events) {
      WindowsController.get('menu')?.webContents?.send(
        'renderer:event:new',
        event
      );
    }
  }

  /**
   * @name persistEvent
   * @summary Persist an event to the store.
   */
  static persistEvent(event: EventCallback): EventCallback {
    if (event.uid === '') {
      event.uid = getUid();
    }

    const { events, updated } = pushUniqueEvent(
      event,
      EventsController.getEventsFromStore()
    );

    // Persist new array to store.
    if (updated) {
      EventsController.persistEventsToStore(events);
      debug('🔷 Event persisted (%o total in store)', events.length);
    }

    return event;
  }

  /**
   * @name updateEventAccountName
   * @summary Update the associated account name for a particular event.
   */
  static updateEventAccountName(
    address: string,
    newName: string
  ): EventCallback[] {
    const all = EventsController.getEventsFromStore();

    const updated = all.map((e: EventCallback) => {
      if (e.who.origin === 'chain') {
        return e;
      }

      // Extract address and account name from iterated event.
      const { address: nextAddress, accountName } = e.who
        .data as EventAccountData;

      // Handle name change.
      if (address === nextAddress && newName !== accountName) {
        return {
          ...e,
          who: { ...e.who, data: { ...e.who.data, accountName: newName } },
        };
      } else {
        return e;
      }
    });

    // Persist updated events to store.
    EventsController.persistEventsToStore(updated);

    // Return the updated events.
    const filtered = updated.filter((e: EventCallback) => {
      if (e.who.origin === 'chain') {
        return false;
      }

      const { address: nextAddress } = e.who.data as EventAccountData;
      return nextAddress === address ? true : false;
    });

    return filtered;
  }

  /**
   * @name removeEvent
   * @summary Remove an event from the store.
   */
  static removeEvent(event: EventCallback): boolean {
    const events = EventsController.getEventsFromStore();

    // Filter out event to remove via its uid.
    const { uid } = event;
    const updated = events.filter((e) => e.uid !== uid);

    // Persist new array to store.
    EventsController.persistEventsToStore(updated);
    debug('🔷 Event removed (%o total in store)', updated.length);

    return true;
  }

  /**
   * @name persistStaleEvent
   * @summary Mark an event stale and persist it to store.
   */
  static persistStaleEvent(uid: string) {
    const stored = EventsController.getEventsFromStore();

    const updated = stored.map((e) => {
      e.uid === uid && (e.stale = true);
      return e;
    });

    EventsController.persistEventsToStore(updated);
  }

  /**
   * @name getEventsFromStore
   * @summary Utility to get parsed events array from the store.
   */
  private static getEventsFromStore = (): EventCallback[] => {
    const stored = (store as Record<string, AnyJson>).get(
      EventsController.storeKey
    ) as string;

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  };

  /**
   * @name persistEventsToStore
   * @summary Utility to persist events array to store.
   */
  private static persistEventsToStore = (events: EventCallback[]) => {
    (store as Record<string, AnyJson>).set(
      EventsController.storeKey,
      JSON.stringify(events)
    );
  };
}
