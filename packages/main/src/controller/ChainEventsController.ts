// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import type {
  AnyData,
  ChainEventSubscription,
  IpcTask,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export class ChainEventsController {
  private static storeKey = 'chain_event_subscriptions';

  /**
   * Process a chain event subscription task.
   */
  static process(task: IpcTask): string | undefined {
    switch (task.action) {
      case 'chainEvents:getAll': {
        return ChainEventsController.getAll();
      }
      case 'chainEvents:insert': {
        const data = task.data;
        ChainEventsController.put(data.chainId, data.subscription);
        break;
      }
      case 'chainEvents:remove': {
        const data = task.data;
        ChainEventsController.remove(data.chainId, data.subscription);
        break;
      }
    }
  }

  /**
   * Utility to compare chain event subscriptions.
   */
  private static cmp = (a: ChainEventSubscription, b: ChainEventSubscription) =>
    a.pallet === b.pallet && a.eventName === b.eventName;

  /**
   * Get all chain event subscriptions from store.
   */
  private static getAll(): string | undefined {
    const key = ChainEventsController.storeKey;
    const stored = (store as Record<string, AnyData>).get(key);
    return stored ? (stored as string) : undefined;
  }

  /**
   * Insert or update a chain event subscription in the store.
   */
  private static put(chainId: ChainID, sub: ChainEventSubscription) {
    const cmp = ChainEventsController.cmp;
    const map = new Map<ChainID, ChainEventSubscription[]>(
      JSON.parse(ChainEventsController.getAll() ?? '[]')
    );
    const updated = (map.get(chainId) ?? []).filter((s) => !cmp(s, sub));
    updated.push(sub);
    map.set(chainId, updated);
    ChainEventsController.updateStore(JSON.stringify([...map]));
  }

  /**
   * Remove a chain event subscription from the store.
   */
  private static remove(chainId: ChainID, sub: ChainEventSubscription) {
    const cmp = ChainEventsController.cmp;
    const stored = ChainEventsController.getAll();
    if (!stored) {
      return;
    }
    const map = new Map<ChainID, ChainEventSubscription[]>(JSON.parse(stored));
    const updated = (map.get(chainId) ?? []).filter((s) => !cmp(s, sub));
    updated.length ? map.set(chainId, updated) : map.delete(chainId);
    ChainEventsController.updateStore(JSON.stringify([...map]));
  }

  /**
   * Update store.
   */
  private static updateStore(ser: string) {
    const key = ChainEventsController.storeKey;
    (store as Record<string, AnyData>).set(key, ser);
  }
}
