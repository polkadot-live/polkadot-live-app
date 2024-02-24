// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency } from '@/config/chains';
import { ellipsisFn } from '@polkadot-cloud/utils';
import { getUid } from '@/utils/CryptoUtils';
import { getUnixTime } from 'date-fns';
import { store } from '@/main';
import { WindowsController } from './WindowsController';
import type { AnyData, AnyJson } from '@/types/misc';
import type { ApiCallEntry } from '@/types/subscriptions';
import type { EventCallback } from '@/types/reporter';

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
  static persistEvent(event: EventCallback) {
    const events = EventsController.getEventsFromStore();

    // Add event to array.
    events.push(event);

    // Persist new array to store.
    EventsController.persistEventsToStore(events);
    console.log(`Event persisted, new array: ${events}`);
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
    console.log(`Event removed, new array: ${updated}`);

    return true;
  }

  /**
   * @name getEvent
   * @summary Instantiate and return a new event based on the recieved entry and custom data.
   */
  static getEvent(entry: ApiCallEntry, newVal: AnyData): EventCallback {
    switch (entry.task.action) {
      /**
       * subscribe:query.timestamp.now
       */
      case 'subscribe:query.timestamp.now': {
        return {
          uid: getUid(),
          category: 'debugging',
          who: {
            chain: entry.task.chainId,
            address: 'none',
          },
          title: `${entry.task.chainId}: New Timestamp`,
          subtitle: `${newVal}`,
          data: {
            timestamp: `${newVal}`,
          },
          timestamp: getUnixTime(new Date()),
          actions: [],
        };
      }

      /**
       * subscribe:query.babe.currentSlot
       */
      case 'subscribe:query.babe.currentSlot': {
        return {
          uid: getUid(),
          category: 'debugging',
          who: {
            chain: entry.task.chainId,
            address: 'none',
          },
          title: `${entry.task.chainId}: Current Slot`,
          subtitle: `${newVal}`,
          data: {
            timestamp: `${newVal}`,
          },
          timestamp: getUnixTime(new Date()),
          actions: [],
        };
      }

      /**
       * subscribe:query.system.account
       */
      case 'subscribe:query.system.account': {
        const address = entry.task.actionArgs!.at(0)!;

        return {
          uid: getUid(),
          category: 'balances',
          who: {
            chain: entry.task.chainId,
            address,
          },
          title: `${ellipsisFn(address)}`,
          subtitle: `Free: ${newVal.free}, Reserved: ${newVal.reserved}, Nonce: ${newVal.nonce}`,
          data: {
            balances: newVal,
          },
          timestamp: getUnixTime(new Date()),
          actions: [],
        };
      }

      /**
       * subscribe:nominationPools:query.system.account
       */
      case 'subscribe:nominationPools:query.system.account': {
        const address = entry.task.account!.address;
        const chainId = entry.task.chainId;
        const pendingRewards =
          entry.task.account!.nominationPoolData?.poolPendingRewards;

        return {
          uid: getUid(),
          category: 'nominationPools',
          who: { chain: chainId, address },
          title: `${ellipsisFn(address)}: Unclaimed Nomination Pool Rewards`,
          subtitle: `${pendingRewards?.toString()} ${chainCurrency(chainId)}`,
          data: { pendingRewards: pendingRewards?.toString() },
          timestamp: getUnixTime(new Date()),
          actions: [
            {
              uri: 'bond',
              text: 'Bond',
            },
            {
              uri: 'withdraw',
              text: 'Withdraw',
            },
            {
              uri: `https://staking.polkadot.network/#/pools?n=${chainId}&a=${address}`,
              text: undefined,
            },
          ],
        };
      }
      default: {
        throw new Error('Subscription task action not recognized');
      }
    }
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
