// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getUid } from '@/utils/CryptoUtils';
import { MainDebug } from '@/utils/DebugUtils';
import { pushEventAndFilterDuplicates } from '@/utils/EventUtils';
import { store } from '@/main';
import { WindowsController } from '@/controller/main/WindowsController';
import type { AnyJson } from '@w3ux/utils/types';
import type { EventCallback } from '@/types/reporter';

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

    const events = pushEventAndFilterDuplicates(
      event,
      EventsController.getEventsFromStore()
    );

    // Persist new array to store.
    EventsController.persistEventsToStore(events);
    debug('🔷 Event persisted (%o total in store)', events.length);

    return event;
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
