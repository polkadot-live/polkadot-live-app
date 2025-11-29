// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import type {
  AnyData,
  ChainEventSubscription,
  FlattenedAccountData,
  IpcTask,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export class ChainEventsController {
  private static storeKey = 'chain_event_subscriptions';
  private static accountScopeKeyPrefix = 'chainEvents';

  /**
   * Process a chain event subscription task.
   */
  static process(task: IpcTask): string | undefined {
    switch (task.action) {
      case 'chainEvents:getAll': {
        return ChainEventsController.getAll();
      }
      case 'chainEvents:getAllForAccount': {
        const { account } = task.data;
        return ChainEventsController.getAllForAccount(account) ?? '[]';
      }
      case 'chainEvents:insert': {
        const data = task.data;
        ChainEventsController.put(data.chainId, data.subscription);
        break;
      }
      case 'chainEvents:insertForAccount': {
        const { account, subscription } = task.data;
        ChainEventsController.putForAccount(account, subscription);
        break;
      }
      case 'chainEvents:removeForAccount': {
        const { account, subscription } = task.data;
        ChainEventsController.removeForAccount(account, subscription);
        break;
      }
      case 'chainEvents:removeAllForAccount': {
        const { account } = task.data;
        ChainEventsController.removeAllForAccount(account);
        break;
      }
      case 'chainEvents:remove': {
        const { chainId, subscription } = task.data;
        ChainEventsController.remove(chainId, subscription);
        break;
      }
      case 'chainEvents:getActiveCount': {
        return ChainEventsController.getActiveCount().toString();
      }
    }
  }

  private static getActiveCount = (): number => {
    const map = new Map<ChainID, ChainEventSubscription[]>(
      JSON.parse(ChainEventsController.getAll() ?? '[]')
    );
    return map.values().reduce((acc, subs) => (acc += subs.length), 0);
  };

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
   * Get all account-scoped chain event subscriptions from store.
   */
  private static getAllForAccount(
    account: FlattenedAccountData
  ): string | undefined {
    const { address, chain: chainId } = account;
    const prefix = ChainEventsController.accountScopeKeyPrefix;
    const key = `${prefix}::${chainId}::${address}`;
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
   * Insert or update an account-scoped chain event subscription in the store.
   */
  private static putForAccount(
    account: FlattenedAccountData,
    sub: ChainEventSubscription
  ) {
    const cmp = ChainEventsController.cmp;
    const stored = ChainEventsController.getAllForAccount(account);
    const cur: ChainEventSubscription[] = stored ? JSON.parse(stored) : [];
    const updated = cur.filter((s) => !cmp(s, sub));
    updated.push(sub);
    const ser = JSON.stringify(updated);
    ChainEventsController.updateStoreForAccount(account, ser);
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
   * Remove an account-scoped chain event subscription from the store.
   */
  private static removeForAccount(
    account: FlattenedAccountData,
    sub: ChainEventSubscription
  ) {
    const cmp = ChainEventsController.cmp;
    const stored = ChainEventsController.getAllForAccount(account);
    if (!stored) {
      return;
    }
    const cur: ChainEventSubscription[] = JSON.parse(stored);
    const updated = cur.filter((s) => !cmp(s, sub));

    // Update store or delete key if no subscriptions remain for account.
    if (updated.length) {
      const ser = JSON.stringify(updated);
      ChainEventsController.updateStoreForAccount(account, ser);
    } else {
      const { address, chain: chainId } = account;
      const prefix = ChainEventsController.accountScopeKeyPrefix;
      const key = `${prefix}::${chainId}::${address}`;
      (store as Record<string, AnyData>).delete(key);
    }
  }

  /**
   * Remove account-scoped chain event subscriptions from the store.
   */
  private static removeAllForAccount(account: FlattenedAccountData) {
    const { address, chain: chainId } = account;
    const prefix = ChainEventsController.accountScopeKeyPrefix;
    const key = `${prefix}::${chainId}::${address}`;
    (store as Record<string, AnyData>).delete(key);
  }

  /**
   * Update store.
   */
  private static updateStore(ser: string) {
    const key = ChainEventsController.storeKey;
    (store as Record<string, AnyData>).set(key, ser);
  }

  /**
   * Update store for account-scoped chain event subscriptions.
   */
  private static updateStoreForAccount(
    account: FlattenedAccountData,
    ser: string
  ) {
    const { address, chain: chainId } = account;
    const prefix = ChainEventsController.accountScopeKeyPrefix;
    const key = `${prefix}::${chainId}::${address}`;
    (store as Record<string, AnyData>).set(key, ser);
  }
}
