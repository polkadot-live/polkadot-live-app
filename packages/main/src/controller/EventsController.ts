// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getUid } from '@/utils/CryptoUtils';
import { MainDebug } from '@/utils/DebugUtils';
import { doRemoveOutdatedEvents, pushUniqueEvent } from '@/utils/EventUtils';
import { store } from '@/main';
import { NotificationsController } from '@/controller/NotificationsController';
import { SettingsController } from '@/controller/SettingsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import { WindowsController } from '@/controller/WindowsController';
import type { AnyJson } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  EventAccountData,
  EventCallback,
  NotificationData,
} from '@polkadot-live/types/reporter';
import type { IpcTask } from '@polkadot-live/types/communication';

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
    if (this.isInitialized) {
      return;
    }

    // Set toggle to indicate stored events have been sent to renderer.
    this.isInitialized = true;

    // Fetch events from store and send them to renderer.
    const events = this.getEventsFromStore();

    // Return if no events are stored.
    if (events.length === 0) {
      return;
    }

    // TODO: Put in utils file to decouple WindowsController, and return `events`.
    for (const event of events) {
      WindowsController.getWindow('menu')?.webContents?.send(
        'renderer:event:new',
        event
      );
    }
  }

  /**
   * @name process
   * @summary Process an IPC task.
   */
  static process(task: IpcTask): void {
    switch (task.action) {
      // Persist an event and show an OS notification if event was persisted.
      // Report event back to frontend after an event UID is assigned.
      case 'events:persist': {
        // Destructure received data.
        interface Target {
          event: EventCallback;
          notification: NotificationData | null;
          isOneShot: boolean;
        }
        const { event, notification, isOneShot }: Target = task.data;

        // Remove any outdated events of the same type, if setting enabled.
        if (!SettingsController.get('setting:keep-outdated-events')) {
          this.removeOutdatedEvents(event);
        }

        // Persist new event to store.
        const { event: eventWithUid, wasPersisted } = this.persistEvent(event);

        // TODO: Decouple showing notification from this function.
        // Show notification if event was added and notification data was received.
        if ((wasPersisted || isOneShot) && notification) {
          const { title, body, subtitle } = notification;
          NotificationsController.showNotification(title, body, subtitle);
        }

        WindowsController.getWindow('menu')?.webContents?.send(
          'renderer:event:new',
          eventWithUid
        );

        return;
      }
      // Mark event stale after extrinsic finalized.
      case 'events:makeStale': {
        const { uid, chainId }: { uid: string; chainId: ChainID } = task.data;

        // Update event in store.
        this.persistStaleEvent(uid);

        // Update event react state.
        WindowsController.getWindow('menu')?.webContents?.send(
          'renderer:event:stale',
          uid,
          chainId
        );

        return;
      }
    }
  }

  /**
   * @name processAsync
   * @summary Process an async IPC task.
   */
  static processAsync(task: IpcTask): string | boolean {
    switch (task.action) {
      case 'events:update:accountName': {
        const {
          address,
          chainId,
          newName,
        }: { address: string; chainId: ChainID; newName: string } = task.data;

        // Update events in storage.
        const updated = this.updateEventAccountName(address, chainId, newName);

        // Update account's subscription tasks in storage.
        SubscriptionsController.updateCachedAccountNameForTasks(
          address,
          chainId,
          newName
        );

        // Return updated events in serialized form.
        return JSON.stringify(updated);
      }
      case 'events:remove': {
        return this.removeEvent(task.data.event);
      }
      case 'events:import': {
        return this.doImport(task.data.events);
      }
      default: {
        return false;
      }
    }
  }

  /**
   * @name persistEvent
   * @summary Persist an event to the store.
   */
  private static persistEvent(event: EventCallback): {
    event: EventCallback;
    wasPersisted: boolean;
  } {
    // Set event UID and persist if it's unique.
    if (event.uid === '') {
      const uid = getUid();
      event.uid = uid;

      // Tx action also cache the event UID.
      event.txActions = event.txActions.map((obj) => {
        obj.txMeta.eventUid = uid;
        return obj;
      });
    }

    const stored = this.getEventsFromStore();
    const { events, updated } = pushUniqueEvent(event, stored);

    // Persist new array to store if event was pushed.
    if (updated) {
      this.persistEventsToStore(events);
      debug('🔷 Event persisted (%o total in store)', events.length);
    }

    return { event, wasPersisted: updated };
  }

  /**
   * @name doImport
   * @summary Persists unique imported events to the store.
   */
  private static doImport(serialized: string): string {
    const parsed: EventCallback[] = JSON.parse(serialized);

    // Update persisted event account names.
    const addressesChecked: string[] = [];
    for (const event of parsed) {
      if (event.who.origin !== 'account') {
        continue;
      }

      const { address, chainId } = event.who.data as EventAccountData;
      const key = `${chainId}:${address}`;
      if (!addressesChecked.includes(key)) {
        addressesChecked.push(key);
        this.syncAccountName(event);
      }
    }

    // Add imported event if it's not a duplicate.
    let stored = this.getEventsFromStore();
    let persist = false;

    for (const event of parsed) {
      const { events, updated } = pushUniqueEvent(event, stored);

      if (updated) {
        stored = events;
        persist = true;
      }
    }

    if (persist) {
      this.persistEventsToStore(stored);
      debug('🔷 Event persisted (%o total in store)', stored.length);
    }

    return JSON.stringify(stored);
  }

  /**
   * @name syncAccountName
   * @summary Updates the associated account names of persisted events.
   * (receives an event that was just imported)
   */
  private static syncAccountName(event: EventCallback) {
    if (event.who.origin !== 'account') {
      return event;
    }

    // Find any imported accounts with the same chainId:address and sync the event's account name.
    const { address, accountName, chainId } = event.who
      .data as EventAccountData;

    const updated = this.getEventsFromStore().map((e: EventCallback) => {
      if (e.who.origin !== 'account') {
        return e;
      }
      const who = e.who.data as EventAccountData;
      if (who.address === address && who.chainId === chainId) {
        (e.who.data as EventAccountData).accountName = accountName;
      }
      return e;
    });

    // Persist updated events to store.
    this.persistEventsToStore(updated);
  }

  /**
   * @name updateEventAccountName
   * @summary Update the associated account name for a particular event.
   */
  private static updateEventAccountName(
    address: string,
    chainId: ChainID,
    newName: string
  ): EventCallback[] {
    const all = this.getEventsFromStore();

    const updated = all.map((e: EventCallback) => {
      if (e.who.origin === 'chain') {
        return e;
      }

      // Extract address and account name from iterated event.
      const {
        accountName,
        address: nextAddress,
        chainId: nextChainId,
      } = e.who.data as EventAccountData;

      // Handle name change.
      if (
        address === nextAddress &&
        chainId === nextChainId &&
        newName !== accountName
      ) {
        return {
          ...e,
          who: { ...e.who, data: { ...e.who.data, accountName: newName } },
        };
      } else {
        return e;
      }
    });

    // Persist updated events to store.
    this.persistEventsToStore(updated);

    // Return the updated events.
    const filtered = updated.filter((e: EventCallback) => {
      if (e.who.origin === 'chain') {
        return false;
      }

      const { address: nextAddress, chainId: nextChainId } = e.who
        .data as EventAccountData;

      return nextAddress === address && chainId === nextChainId ? true : false;
    });

    return filtered;
  }

  /**
   * @name removeEvent
   * @summary Remove an event from the store.
   */
  private static removeEvent(event: EventCallback): boolean {
    const events = this.getEventsFromStore();

    // Filter out event to remove via its uid.
    const { uid } = event;
    const updated = events.filter((e) => e.uid !== uid);

    // Persist new array to store.
    this.persistEventsToStore(updated);
    debug('🔷 Event removed (%o total in store)', updated.length);

    return true;
  }

  /**
   * @name getBackupData
   * @summary Get all stored events in serialized form.
   */
  static getBackupData(): string {
    const stored = this.getEventsFromStore();
    const filtered = stored.filter(({ category }) => category !== 'debugging');
    return JSON.stringify(filtered);
  }

  /**
   * @name removeOutdatedEvents
   * @summary Remove outdated events from the store.
   *
   * Currently only for nomination pool rewards and nominating pending payout events.
   * Will remove old matching events from the store.
   */
  private static removeOutdatedEvents(event: EventCallback) {
    const all = this.getEventsFromStore();
    const { updated, events } = doRemoveOutdatedEvents(event, all);
    updated && this.persistEventsToStore(events);
  }

  /**
   * @name persistStaleEvent
   * @summary Mark an event stale and persist it to store.
   */
  private static persistStaleEvent(uid: string) {
    const stored = this.getEventsFromStore();

    const updated = stored.map((e) => {
      e.uid === uid && (e.stale = true);
      return e;
    });

    this.persistEventsToStore(updated);
  }

  /**
   * @name getEventsFromStore
   * @summary Utility to get parsed events array from the store.
   */
  private static getEventsFromStore = (): EventCallback[] => {
    const stored = (store as Record<string, AnyJson>).get(
      this.storeKey
    ) as string;

    return !stored ? [] : JSON.parse(stored);
  };

  /**
   * @name persistEventsToStore
   * @summary Utility to persist events array to store.
   */
  private static persistEventsToStore = (events: EventCallback[]) => {
    (store as Record<string, AnyJson>).set(
      this.storeKey,
      JSON.stringify(events)
    );
  };
}
