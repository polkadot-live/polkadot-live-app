// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { doRemoveOutdatedEvents, pushUniqueEvent } from '@polkadot-live/core';
import {
  NotificationsController,
  SettingsController,
  SubscriptionsController,
  WindowsController,
} from '../controller';
import { EventsRepository } from '../db';
import { getUid } from '../utils/CryptoUtils';
import { MainDebug } from '../utils/DebugUtils';
import { AddressesController } from './AddressesController';
import type {
  AccountSource,
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IpcTask } from '@polkadot-live/types/communication';
import type {
  EventAccountData,
  EventCallback,
  EventCategory,
  EventFetchPayload,
  NotificationData,
} from '@polkadot-live/types/reporter';

const debug = MainDebug.extend('EventsController');

export class EventsController {
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
    const events = EventsRepository.getAll();
    if (events.length === 0) {
      return;
    }

    // TODO: Put in utils file to decouple WindowsController, and return `events`.
    for (const event of events) {
      WindowsController.getWindow('menu')?.webContents?.send(
        'renderer:event:new',
        event,
        false, // Old event.
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
          notification: NotificationData;
          showNotification: {
            isOneShot: boolean;
            isEnabled: boolean;
          };
        }
        const { event, notification, showNotification }: Target = task.data;
        const { isOneShot, isEnabled } = showNotification;
        const key = 'setting:silence-os-notifications';
        const silenced = SettingsController.get(key);
        const notify = isOneShot ? true : silenced ? false : isEnabled;

        // Remove any outdated events of the same type, if setting enabled.
        if (!SettingsController.get('setting:keep-outdated-events')) {
          EventsController.removeOutdatedEvents(event);
        }

        // TODO: Decouple showing notification from this function.
        // Persist new event to store.
        const { event: eventWithUid, wasPersisted } =
          EventsController.persistEvent(event);
        if (isOneShot || (wasPersisted && notify)) {
          const { title, body, subtitle } = notification;
          NotificationsController.showNotification(title, body, subtitle);
        }

        WindowsController.getWindow('menu')?.webContents?.send(
          'renderer:event:new',
          eventWithUid,
          true, // New event.
        );

        return;
      }
      // Mark event stale after extrinsic finalized.
      case 'events:makeStale': {
        const { uid, chainId }: { uid: string; chainId: ChainID } = task.data;

        // Update event in store.
        EventsController.persistStaleEvent(uid);

        // Update event react state.
        WindowsController.getWindow('menu')?.webContents?.send(
          'renderer:event:stale',
          uid,
          chainId,
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
        const updated = EventsController.updateEventAccountName(
          address,
          chainId,
          newName,
        );

        // Update account's subscription tasks in storage.
        SubscriptionsController.updateCachedAccountNameForTasks(
          address,
          chainId,
          newName,
        );

        // Return updated events in serialized form.
        return JSON.stringify(updated);
      }
      case 'events:clearAll': {
        return EventsController.clearAll(task.data.category);
      }
      case 'events:remove': {
        return EventsController.removeEvent(task.data.event);
      }
      case 'events:import': {
        return EventsController.doImport(task.data.events);
      }
      case 'events:fetch': {
        const { payload }: { payload: EventFetchPayload } = task.data;
        return EventsController.fetch(payload);
      }
      case 'events:counts': {
        return EventsController.counts();
      }
      default: {
        return false;
      }
    }
  }

  /**
   * @name clearAll
   * @summary Remove all events in a given cateory.
   */
  private static clearAll(category: EventCategory): boolean {
    const events = EventsRepository.getAll().filter(
      (e) => e.category !== category,
    );
    EventsRepository.replaceAll(events);
    return true;
  }

  /**
   * @name counts
   * @summary Return event counts by category.
   */
  private static counts() {
    const result: Partial<Record<EventCategory, number>> = {};
    for (const { category } of EventsRepository.getAll()) {
      result[category] = (result[category] ?? 0) + 1;
    }
    return JSON.stringify(result);
  }

  /**
   * @name fetch
   * @summary Fetch events from database with a specific category.
   */
  private static fetch(payload: EventFetchPayload) {
    const { category, limit, order, cursor } = payload;

    const all = EventsRepository.getAll()
      .filter((e) => e.category === category)
      .sort((a, b) => {
        if (a.timestamp === b.timestamp) {
          return order === 'desc'
            ? b.uid.localeCompare(a.uid)
            : a.uid.localeCompare(b.uid);
        }
        return order === 'desc'
          ? b.timestamp - a.timestamp
          : a.timestamp - b.timestamp;
      });

    if (!cursor) {
      return JSON.stringify(all.slice(0, limit));
    }

    const filterDesc = (e: EventCallback) =>
      e.timestamp < cursor.timestamp ||
      (e.timestamp === cursor.timestamp && e.uid < cursor.uid);

    const filterAsc = (e: EventCallback) =>
      e.timestamp > cursor.timestamp ||
      (e.timestamp === cursor.timestamp && e.uid > cursor.uid);

    const page = all.filter(order === 'desc' ? filterDesc : filterAsc);
    return JSON.stringify(page.slice(0, limit));
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

    const stored = EventsRepository.getAll();
    const { events, updated } = pushUniqueEvent(event, stored);

    // Persist new array to store if event was pushed.
    if (updated) {
      EventsRepository.replaceAll(events);
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
    EventsController.syncAccountNames();

    let stored = EventsRepository.getAll();
    let persist = false;

    const isChainEvent = (e: EventCallback) => e.who.origin === 'chainEvent';

    // Process non-chain events.
    for (const event of parsed.filter((e) => !isChainEvent(e))) {
      const res = pushUniqueEvent(event, stored);
      if (res.updated) {
        stored = res.events;
        persist = true;
      }
    }
    // Process chain events.
    const storedUids = new Set(stored.map((e) => e.uid));
    for (const event of parsed.filter(isChainEvent)) {
      if (!storedUids.has(event.uid)) {
        stored = [...stored, event];
        storedUids.add(event.uid);
        persist = true;
      }
    }
    if (persist) {
      EventsRepository.replaceAll(stored);
      debug('🔷 Event persisted (%o total in store)', stored.length);
    }

    return JSON.stringify(stored);
  }

  /**
   * @name syncAccountName
   * @summary Updates the associated account names of persisted events.
   */
  private static syncAccountNames() {
    const accounts = EventsController.getAllGenericAccounts();
    const updated = EventsRepository.getAll().map((e: EventCallback) => {
      if (e.who.origin !== 'account') {
        return e;
      }

      const who = e.who.data as EventAccountData;
      const encoded: EncodedAccount[] = [];

      for (const { encodedAccounts } of accounts) {
        const enAccount = encodedAccounts?.[who.chainId] ?? null;
        enAccount && encoded.push(enAccount);
      }

      for (const { address, alias } of encoded) {
        if (who.address === address) {
          (e.who.data as EventAccountData).accountName = alias;
        }
      }

      return e;
    });

    EventsRepository.replaceAll(updated);
  }

  /**
   * @name getAllGenericAccounts
   * @summary Retrieves all generic accounts and returns them as an array.
   */
  private static getAllGenericAccounts(): ImportedGenericAccount[] {
    const serialized = AddressesController.getAll();
    const map = new Map<AccountSource, string>(JSON.parse(serialized));

    return Array.from(map.values()).flatMap(
      (ser) => JSON.parse(ser) as ImportedGenericAccount[],
    );
  }

  /**
   * @name updateEventAccountName
   * @summary Update the associated account name for a particular event.
   */
  private static updateEventAccountName(
    address: string,
    chainId: ChainID,
    newName: string,
  ): EventCallback[] {
    const all = EventsRepository.getAll();

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
    EventsRepository.replaceAll(updated);

    // Return the updated events.
    const filtered = updated.filter((e: EventCallback) => {
      if (e.who.origin === 'chain') {
        return false;
      }

      const { address: nextAddress, chainId: nextChainId } = e.who
        .data as EventAccountData;

      return !!(nextAddress === address && chainId === nextChainId);
    });

    return filtered;
  }

  /**
   * @name removeEvent
   * @summary Remove an event from the store.
   */
  private static removeEvent(event: EventCallback): boolean {
    const { uid } = event;
    EventsRepository.delete(uid);
    const updated = EventsRepository.getAll();
    debug('🔷 Event removed (%o total in store)', updated.length);
    return true;
  }

  /**
   * @name getBackupData
   * @summary Get all stored events in serialized form.
   */
  static getBackupData(): string {
    const stored = EventsRepository.getAll();
    const filtered = stored.filter(({ category }) => category !== 'Debugging');
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
    const all = EventsRepository.getAll();
    const { updated, events } = doRemoveOutdatedEvents(event, all);
    updated && EventsRepository.replaceAll(events);
  }

  /**
   * @name persistStaleEvent
   * @summary Mark an event stale and persist it to store.
   */
  private static persistStaleEvent(uid: string) {
    EventsRepository.markStale(uid);
  }
}
