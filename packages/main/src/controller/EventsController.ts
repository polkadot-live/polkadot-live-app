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

export class EventsController {
  // Set to `true` when app initializes and persisted events
  // are sent to the renderer.
  private static isInitialized = false;

  // ===== Initialize =====

  // Fetch persisted events and send to frontend.
  static initialize() {
    if (EventsController.isInitialized) {
      return;
    }
    // Set toggle to indicate stored events have been sent to renderer.
    EventsController.isInitialized = true;

    // Send stored events to renderer.
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

  // ===== IPC Task Processing =====

  static process(task: IpcTask): void {
    switch (task.action) {
      case 'events:persist': {
        EventsController.persistEventSync(task);
        return;
      }
      case 'events:makeStale': {
        EventsController.markStale(task);
        return;
      }
    }
  }

  static processAsync(task: IpcTask): string | boolean {
    switch (task.action) {
      case 'events:update:accountName': {
        return EventsController.updateAccountName(task);
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

  // ===== Public =====

  // Get all stored events in serialized form.
  static getBackupData(): string {
    const stored = EventsRepository.getAll();
    const filtered = stored.filter(({ category }) => category !== 'Debugging');
    return JSON.stringify(filtered);
  }

  // ===== Private =====

  // Remove all events in a given category.
  private static clearAll(category: EventCategory): boolean {
    EventsRepository.deleteByCategory(category);
    return true;
  }

  // Return event counts by category.
  private static counts() {
    const result: Partial<Record<EventCategory, number>> = {};
    for (const { category } of EventsRepository.getAll()) {
      result[category] = (result[category] ?? 0) + 1;
    }
    return JSON.stringify(result);
  }

  // Persist unique imported events to the store.
  private static doImport(serialized: string): string {
    const parsed: EventCallback[] = JSON.parse(serialized);
    EventsController.syncAccountNames();

    let stored = EventsRepository.getAll();
    const newEvents: EventCallback[] = [];
    const isChainEvent = (e: EventCallback) => e.who.origin === 'chainEvent';

    // Process non-chain events.
    for (const event of parsed.filter((e) => !isChainEvent(e))) {
      const res = pushUniqueEvent(event, stored);
      if (res.updated) {
        stored = res.events;
        newEvents.push(event);
      }
    }

    // Process chain events.
    const storedUids = new Set(stored.map((e) => e.uid));
    for (const event of parsed.filter(isChainEvent)) {
      if (!storedUids.has(event.uid)) {
        stored = [...stored, event];
        storedUids.add(event.uid);
        newEvents.push(event);
      }
    }

    // Insert new events.
    if (newEvents.length > 0) {
      EventsRepository.insertMany(newEvents);
    }

    return JSON.stringify(stored);
  }

  // Fetch events from database with a specific category.
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

  // Mark event stale after extrinsic finalized.
  private static markStale(task: IpcTask) {
    const { uid, chainId }: { uid: string; chainId: ChainID } = task.data;
    // Update event in store.
    EventsController.persistStaleEvent(uid);
    // Update event react state.
    WindowsController.getWindow('menu')?.webContents?.send(
      'renderer:event:stale',
      uid,
      chainId,
    );
  }

  // Persist an event and show an OS notification if event was persisted.
  private static persistEventSync(task: IpcTask) {
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

    // Remove any outdated events if setting enabled.
    if (!SettingsController.get('setting:keep-outdated-events')) {
      EventsController.removeOutdatedEvents(event);
    }

    // Persist event to store.
    const { event: eventWithUid, wasPersisted } =
      EventsController.persistEvent(event);

    // TODO: Decouple showing notification from this function.
    if (isOneShot || (wasPersisted && notify)) {
      const { title, body, subtitle } = notification;
      NotificationsController.showNotification(title, body, subtitle);
    }

    // Report event back to frontend after an event UID is assigned.
    WindowsController.getWindow('menu')?.webContents?.send(
      'renderer:event:new',
      eventWithUid,
      true, // New event.
    );
  }

  // Mark an event stale.
  private static persistStaleEvent(uid: string) {
    EventsRepository.markStale(uid);
  }

  // Remove an event.
  private static removeEvent(event: EventCallback): boolean {
    EventsRepository.delete(event.uid);
    return true;
  }

  // Remove outdated events.
  private static removeOutdatedEvents(event: EventCallback) {
    // Currently only for nomination pool rewards and nominating pending payout events.
    // Will remove old matching events.
    const all = EventsRepository.getAll();
    const { updated, removed } = doRemoveOutdatedEvents(event, all);

    // Delete only the outdated events.
    if (updated && removed && removed.length > 0) {
      EventsRepository.deleteMany(removed.map((e) => e.uid));
    }
  }

  // Update persisted events with new account name and return updated events.
  private static updateAccountName(task: IpcTask): string {
    type T = { address: string; chainId: ChainID; newName: string };
    const { address, chainId, newName }: T = task.data;

    // Update names in storage.
    const params = { address, chainId, newName };
    const updated = EventsController.updateEventAccountName(params);
    SubscriptionsController.updateCachedAccountNameForTasks(params);
    return JSON.stringify(updated);
  }

  // Persist events with new account name and return updated events.
  private static updateEventAccountName(params: {
    address: string;
    chainId: ChainID;
    newName: string;
  }): EventCallback[] {
    const { address, chainId, newName } = params;
    const all = EventsRepository.getAll();

    const isAccountEvent = (e: EventCallback) => e.who.origin !== 'chain';
    const matchesAccount = (data: EventAccountData) =>
      data.address === address && data.chainId === chainId;

    const updates: Array<{ uid: string; whoData: unknown }> = [];
    const filtered: EventCallback[] = [];

    for (const e of all) {
      if (!isAccountEvent(e)) continue;

      const data = e.who.data as EventAccountData;
      if (matchesAccount(data)) {
        // Create updated event with new account name.
        const updatedData = { ...data, accountName: newName };
        const updatedEvent = {
          ...e,
          who: { ...e.who, data: updatedData },
        };
        // Only update if the name actually changed.
        if (newName !== data.accountName) {
          updates.push({ uid: e.uid, whoData: updatedData });
        }
        filtered.push(updatedEvent);
      }
    }
    // Update only the events that changed in the database.
    if (updates.length > 0) {
      EventsRepository.updateWhoDdataMany(updates);
    }
    return filtered;
  }

  // ===== Utilities =====

  // Returns all generic accounts as an array.
  private static getAllGenericAccounts(): ImportedGenericAccount[] {
    const serialized = AddressesController.getAll();
    const map = new Map<AccountSource, string>(JSON.parse(serialized));
    return Array.from(map.values()).flatMap(
      (ser) => JSON.parse(ser) as ImportedGenericAccount[],
    );
  }

  // Persist an event.
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
    const { updated } = pushUniqueEvent(event, stored);

    // Persist event to store if it was pushed.
    if (updated) {
      EventsRepository.insert(event);
    }
    return { event, wasPersisted: updated };
  }

  // Updates events associated account names.
  private static syncAccountNames() {
    const accounts = EventsController.getAllGenericAccounts();
    const all = EventsRepository.getAll();
    const updates: Array<{ uid: string; whoData: unknown }> = [];

    for (const event of all) {
      if (event.who.origin !== 'account') continue;

      const who = event.who.data as EventAccountData;
      const encoded: EncodedAccount[] = [];

      for (const { encodedAccounts } of accounts) {
        const enAccount = encodedAccounts?.[who.chainId] ?? null;
        enAccount && encoded.push(enAccount);
      }

      for (const { address, alias } of encoded) {
        if (who.address === address && who.accountName !== alias) {
          // Only update if the name actually changed.
          const updatedData = { ...who, accountName: alias };
          updates.push({ uid: event.uid, whoData: updatedData });
          break; // Found matching account, no need to continue.
        }
      }
    }

    // Update event names.
    if (updates.length > 0) {
      EventsRepository.updateWhoDdataMany(updates);
    }
  }
}
