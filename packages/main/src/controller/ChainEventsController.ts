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
  private static activeRefsKey = 'chainEvents_activeRefs';
  private static scopeKeyPrefix = 'chainEvents';

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
      case 'chainEvents:insertRefSubs': {
        const { chainId, refId, serialized } = task.data;
        ChainEventsController.putSubsForRef(chainId, refId, serialized);
        break;
      }
      case 'chainEvents:getActiveRefIds': {
        return JSON.stringify(ChainEventsController.getActiveRefIds());
      }
      case 'chainEvents:getAllRefSubs': {
        return ChainEventsController.getAllRefSubs();
      }
      case 'chainEvents:getAllRefSubsForChain': {
        const { chainId } = task.data;
        return JSON.stringify(
          ChainEventsController.getAllRefSubsForChain(chainId)
        );
      }
      case 'chainEvents:removeRefSubs': {
        const { chainId, refId, serialized } = task.data;
        ChainEventsController.removeSubsForRef(chainId, refId, serialized);
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

  private static getActiveRefIds = (): string[] => {
    const key = ChainEventsController.activeRefsKey;
    const raw = (store as Record<string, AnyData>).get(key);
    const cur: string[] = raw ? JSON.parse(raw) : [];
    return cur;
  };

  private static getAllRefSubs = (): string => {
    // Get active ref ids.
    const idsKey = ChainEventsController.activeRefsKey;
    const idsRaw = (store as Record<string, AnyData>).get(idsKey);
    const idsCur: string[] = idsRaw ? JSON.parse(idsRaw) : [];
    const idsObj = idsCur.map((k) => {
      const s = k.split('::');
      return { chainId: s[0] as ChainID, refId: parseInt(s[1]) };
    });

    // Construct record chainId -> refId -> subscriptions.
    const prefix = ChainEventsController.scopeKeyPrefix;
    const chainIds = new Set(idsObj.map(({ chainId }) => chainId));
    const recResult: Record<
      string,
      Record<number, ChainEventSubscription[]>
    > = {};

    for (const cid of chainIds) {
      const refIds = idsObj
        .filter(({ chainId }) => chainId === cid)
        .map(({ refId }) => refId);

      const recRefs: Record<number, ChainEventSubscription[]> = {};
      for (const refId of refIds) {
        const key = `${prefix}::${cid}::${refId}`;
        const raw = (store as Record<string, AnyData>).get(key);
        raw !== undefined && (recRefs[refId] = JSON.parse(raw));
      }
      recResult[cid] = recRefs;
    }
    return JSON.stringify(recResult);
  };

  private static getAllRefSubsForChain = (
    chainId: ChainID
  ): ChainEventSubscription[] => {
    const cacheKey = ChainEventsController.activeRefsKey;
    const rawIds = (store as Record<string, AnyData>).get(cacheKey);
    const cur: string[] = rawIds ? JSON.parse(rawIds) : [];

    const refIds = cur
      .map((id) => {
        const s = id.split('::');
        return { cid: s[0] as ChainID, rid: parseInt(s[1]) };
      })
      .filter(({ cid }) => cid === chainId)
      .map(({ rid }) => rid);

    let subs: ChainEventSubscription[] = [];
    const prefix = ChainEventsController.scopeKeyPrefix;
    for (const refId of refIds) {
      const key = `${prefix}::${chainId}::${refId}`;
      const raw = (store as Record<string, AnyData>).get(key);
      subs = subs.concat(
        raw ? (JSON.parse(raw) as ChainEventSubscription[]) : []
      );
    }
    return subs;
  };

  private static putSubsForRef = (
    chainId: ChainID,
    refId: number,
    serialized: string
  ) => {
    ChainEventsController.putActiveRefId(chainId, refId);
    const parsed: ChainEventSubscription[] = JSON.parse(serialized);
    if (!parsed.length) {
      return;
    }
    const cmp = ChainEventsController.cmp;
    const stored = ChainEventsController.getAllForRef(chainId, refId);
    const updated = stored
      .filter((a) => !parsed.find((b) => cmp(a, b)))
      .concat(parsed);
    ChainEventsController.updateStoreForRef(chainId, refId, updated);
  };

  private static removeSubsForRef = (
    chainId: ChainID,
    refId: number,
    serialized: string
  ) => {
    const parsed: ChainEventSubscription[] = JSON.parse(serialized);
    if (!parsed.length) {
      return;
    }
    const cmp = ChainEventsController.cmp;
    const stored = ChainEventsController.getAllForRef(chainId, refId);
    const updated = stored.filter((a) => !parsed.find((b) => cmp(a, b)));
    ChainEventsController.updateStoreForRef(chainId, refId, updated);
  };

  // Functions to control cached ref ids.
  private static putActiveRefId = (chainId: ChainID, refId: number) => {
    const key = ChainEventsController.activeRefsKey;
    const raw = (store as Record<string, AnyData>).get(key);
    const cur: string[] = raw ? JSON.parse(raw) : [];

    const newId = `${chainId}::${refId}`;
    const exists = cur.find((id) => id === newId);
    if (!exists) {
      const updated = JSON.stringify([...cur, newId]);
      (store as Record<string, AnyData>).set(key, updated);
    }
  };

  static removeActiveRefId = (chainId: ChainID, refId: number) => {
    const key = ChainEventsController.activeRefsKey;
    const raw = (store as Record<string, AnyData>).get(key);
    const cur: string[] = raw ? JSON.parse(raw) : [];

    const rmId = `${chainId}::${refId}`;
    const next = JSON.stringify(cur.filter((id) => id !== rmId));
    (store as Record<string, AnyData>).set(key, next);
  };

  // Get all persisted ref chain event subscriptions.
  private static getAllForRef = (
    chainId: ChainID,
    refId: number
  ): ChainEventSubscription[] => {
    const prefix = ChainEventsController.scopeKeyPrefix;
    const key = `${prefix}::${chainId}::${refId}`;
    const ser = (store as Record<string, AnyData>).get(key);
    return ser ? JSON.parse(ser) : [];
  };

  // Persist chain events subscriptions for a ref.
  private static updateStoreForRef = (
    chainId: ChainID,
    refId: number,
    subs: ChainEventSubscription[]
  ) => {
    const prefix = ChainEventsController.scopeKeyPrefix;
    const key = `${prefix}::${chainId}::${refId}`;
    const ser = JSON.stringify(subs);
    (store as Record<string, AnyData>).set(key, ser);
  };

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
    const prefix = ChainEventsController.scopeKeyPrefix;
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
      const prefix = ChainEventsController.scopeKeyPrefix;
      const key = `${prefix}::${chainId}::${address}`;
      (store as Record<string, AnyData>).delete(key);
    }
  }

  /**
   * Remove account-scoped chain event subscriptions from the store.
   */
  private static removeAllForAccount(account: FlattenedAccountData) {
    const { address, chain: chainId } = account;
    const prefix = ChainEventsController.scopeKeyPrefix;
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
    const prefix = ChainEventsController.scopeKeyPrefix;
    const key = `${prefix}::${chainId}::${address}`;
    (store as Record<string, AnyData>).set(key, ser);
  }
}
