// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { getChainEventAdapter } from './adapters';
import {
  ChainPallets,
  getEventSubscriptions,
  getEventSubscriptionsForAccount,
  getEventSubscriptionsForRef,
} from '@polkadot-live/consts/subscriptions/chainEvents';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';
import type { ChainEventsContextInterface } from '../../../types/main';

export const ChainEventsContext = createContext<
  ChainEventsContextInterface | undefined
>(undefined);

export const useChainEvents = createSafeContextHook(
  ChainEventsContext,
  'ChainEventsContext'
);

export const ChainEventsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getChainEventAdapter();

  /**
   * Active chain subscriptions.
   */
  const [activeChain, setActiveChain] = useState<ChainID | null>(null);
  const [subscriptions, setSubscriptions] = useState<
    Map<ChainID, ChainEventSubscription[]>
  >(new Map());

  /**
   * Active account-based subscriptions.
   */
  const [activeAccount, setActiveAccount] =
    useState<FlattenedAccountData | null>(null);

  const [accountSubscriptions, setAccountSubscriptions] = useState<
    Map<string, ChainEventSubscription[]>
  >(new Map());

  /**
   * Active referendum-based subscriptions.
   */
  const [activeRefChain, setActiveRefChain] = useState<ChainID | null>(null);
  const [refSubscriptions, setRefSubscriptions] = useState<
    Map<ChainID, Map<number /* refId */, ChainEventSubscription[]>>
  >(new Map());

  const refChainHasSubs = (chainId: ChainID): boolean => {
    const refs = refSubscriptions.get(chainId);
    if (!refs) {
      return false;
    }
    for (const subs of refs.values()) {
      if (subs.find((s) => s.enabled)) {
        return true;
      }
    }
    return false;
  };

  const countActiveRefSubs = (): number => {
    let count = 0;
    for (const refIds of refSubscriptions.values()) {
      for (const subs of refIds.values()) {
        count += subs.filter((s) => s.enabled).length;
      }
    }
    return count;
  };

  const refActiveSubCount = (refId: number): number => {
    if (!activeRefChain) {
      return 0;
    }
    const refs = refSubscriptions.get(activeRefChain);
    if (!refs) {
      return 0;
    }
    const subs = refs.get(refId);
    if (!subs) {
      return 0;
    }
    return subs.filter((s) => s.enabled).length;
  };

  const addSubsForRef = (chainId: ChainID, refId: number) => {
    let updated: ChainEventSubscription[] = [];
    setRefSubscriptions((prev) => {
      type T = Map<number, ChainEventSubscription[]>;
      const map: T = prev.get(chainId) ?? new Map();
      const subs = getEventSubscriptionsForRef(chainId, refId);
      updated = [...subs];
      const newMap = new Map(map).set(refId, updated);
      return new Map(prev).set(chainId, newMap);
    });
    const active = updated.filter(({ enabled }) => enabled);
    adapter.storeInsertForRef(chainId, refId, active);
  };

  const removeSubsForRef = (chainId: ChainID, refId: number) => {
    let removed: ChainEventSubscription[] = [];

    setRefSubscriptions((prev) => {
      const chainMap = prev.get(chainId);
      if (!chainMap) {
        return prev;
      }
      // Get the subs that will be removed.
      removed = chainMap.get(refId) ?? [];
      const newMap = new Map(chainMap);
      newMap.delete(refId);

      // If chain becomes empty, remove it entirely.
      if (newMap.size === 0) {
        const newTop = new Map(prev);
        newTop.delete(chainId);
        return newTop;
      }
      // Otherwise, update the chain's map.
      return new Map(prev).set(chainId, newMap);
    });

    const active = removed.filter(({ enabled }) => enabled);
    adapter.storeRemoveForRef(chainId, refId, active);
  };

  const getCategorisedRefsForChain = (): Record<
    number,
    ChainEventSubscription[]
  > => {
    if (!activeRefChain) {
      return {};
    }
    const chainMap = refSubscriptions.get(activeRefChain);
    if (!chainMap) {
      return {};
    }
    return Object.fromEntries(
      Array.from(chainMap.entries())
        .sort(([a], [b]) => b - a)
        .map(([refId, subs]) => [
          refId,
          [...subs].sort((a, b) => a.label.localeCompare(b.label)),
        ])
    );
  };

  const getCategorisedForAccount = (
    account: FlattenedAccountData
  ): Record<string, ChainEventSubscription[]> => {
    const { address, chain: chainId } = account;
    const key = `${chainId}::${address}`;
    const map = new Map<string, ChainEventSubscription[]>();

    for (const sub of accountSubscriptions.get(key) || []) {
      const { pallet: p } = sub;
      map.has(p)
        ? map.set(p, [...map.get(p)!.filter((s) => !cmp(s, sub)), sub])
        : map.set(p, [sub]);
    }
    const result: Record<string, ChainEventSubscription[]> = {};
    for (const [k, v] of map.entries()) {
      result[k] = v.sort((a, b) => a.label.localeCompare(b.label));
    }
    return result;
  };

  const accountHasSubs = (account: FlattenedAccountData): boolean => {
    const { address, chain: chainId } = account;
    const key = `${chainId}::${address}`;
    const subs = accountSubscriptions.get(key);
    return subs ? subs.filter(({ enabled }) => enabled).length > 0 : false;
  };

  const accountSubCount = (account: FlattenedAccountData) =>
    adapter.getSubCountForAccount(account);

  const accountSubCountForPallet = (pallet: string): number => {
    if (!activeAccount) {
      return 0;
    }
    const { address, chain: chainId } = activeAccount;
    const key = `${chainId}::${address}`;
    return (
      accountSubscriptions
        .get(key)
        ?.filter((s) => s.pallet === pallet)
        .filter(({ enabled }) => enabled).length ?? 0
    );
  };

  // Called when account is deleted or removed.
  const removeAllForAccount = (account: FlattenedAccountData) => {
    const { address, chain: chainId } = account;
    const key = `${chainId}::${address}`;

    // Clear store and state.
    adapter.storeRemoveAllForAccount(account);
    setAccountSubscriptions((prev) => {
      prev.delete(key);
      return prev;
    });
  };

  /**
   * Compare utility.
   */
  const cmp = (a: ChainEventSubscription, b: ChainEventSubscription) =>
    a.pallet === b.pallet && a.eventName === b.eventName;

  /**
   * Subscription toggle handler.
   */
  const toggle = async (sub: ChainEventSubscription) => {
    switch (sub.kind) {
      case 'account':
        toggleForAccount(sub);
        break;
      case 'chain':
        toggleForChain(sub);
        break;
      case 'referendum': {
        toggleForRef(sub);
        break;
      }
    }
  };

  /**
   * Handler to toggle OS notifications.
   */
  const toggleOsNotify = (sub: ChainEventSubscription, updateStore = true) => {
    switch (sub.kind) {
      case 'account':
        toggleOsNotifyForAccount(sub, updateStore);
        break;
      case 'chain':
        toggleOsNotifyForChain(sub, updateStore);
        break;
      case 'referendum':
        toggleOsNotifyForRef(sub, updateStore);
        break;
    }
  };

  /**
   * Toggle referenda-scoped event subscription.
   */
  const toggleForRef = async (sub: ChainEventSubscription) => {
    if (!activeRefChain) {
      return;
    }
    const refId = parseInt(sub.id.split('::')[1]);
    sub.enabled = !sub.enabled;
    setRefSubscriptions((prev) => {
      const next = new Map(prev);
      const refs = next.get(activeRefChain);
      if (!refs) {
        return prev;
      }
      const subs = refs.get(refId);
      if (!subs) {
        return prev;
      }
      const updated = subs.map((a) => (cmp(a, sub) ? sub : a));
      refs.set(refId, updated);
      return next;
    });
    sub.enabled
      ? adapter.storeInsertForRef(activeRefChain, refId, [sub])
      : adapter.storeRemoveForRef(activeRefChain, refId, [sub]);
  };

  const toggleOsNotifyForRef = (
    sub: ChainEventSubscription,
    updateStore = true
  ) => {
    if (!activeRefChain) {
      return;
    }
    const refId = parseInt(sub.id.split('::')[1]);
    sub.osNotify = !sub.osNotify;
    setRefSubscriptions((prev) => {
      const next = new Map(prev);
      const refs = next.get(activeRefChain);
      if (!refs) {
        return prev;
      }
      const subs = refs.get(refId);
      if (!subs) {
        return prev;
      }
      const updated = subs.map((a) => (cmp(a, sub) ? sub : a));
      refs.set(refId, updated);
      return next;
    });
    updateStore && adapter.toggleNotifyForRef(activeRefChain, refId, sub);
  };

  /**
   * Toggle chain-scoped event subscription.
   */
  const toggleForChain = async (sub: ChainEventSubscription) => {
    if (!activeChain) {
      return;
    }
    sub.enabled = !sub.enabled;
    setSubscriptions((prev) => {
      const existing = prev.get(activeChain) ?? [];
      const updated = existing.filter((s) => !cmp(s, sub)).concat(sub);
      return new Map(prev).set(activeChain, updated);
    });
    sub.enabled
      ? adapter.storeInsert(activeChain, sub)
      : adapter.storeRemove(activeChain, sub);
  };

  const toggleOsNotifyForChain = (
    sub: ChainEventSubscription,
    updateStore = true
  ) => {
    if (!activeChain) {
      return;
    }
    sub.osNotify = !sub.osNotify;
    setSubscriptions((prev) => {
      const existing = prev.get(activeChain) ?? [];
      const updated = existing.map((s) => (cmp(s, sub) ? sub : s));
      return new Map(prev).set(activeChain, updated);
    });
    updateStore && adapter.toggleNotify(activeChain, sub);
  };

  /**
   * Toggle account-scoped event subscription.
   */
  const toggleForAccount = async (sub: ChainEventSubscription) => {
    if (!activeAccount) {
      return;
    }
    sub.enabled = !sub.enabled;
    setAccountSubscriptions((prev) => {
      const key = `${activeAccount.chain}::${activeAccount.address}`;
      const existing = prev.get(key) ?? [];
      const updated = existing.filter((s) => !cmp(s, sub)).concat(sub);
      return new Map(prev).set(key, updated);
    });
    sub.enabled
      ? adapter.storeInsertForAccount(activeAccount, sub)
      : adapter.storeRemoveForAccount(activeAccount, sub);
  };

  const toggleOsNotifyForAccount = (
    sub: ChainEventSubscription,
    updateStore = true
  ) => {
    if (!activeAccount) {
      return;
    }
    sub.osNotify = !sub.osNotify;
    setAccountSubscriptions((prev) => {
      const key = `${activeAccount.chain}::${activeAccount.address}`;
      const existing = prev.get(key) ?? [];
      const updated = existing.filter((s) => !cmp(s, sub)).concat(sub);
      return new Map(prev).set(key, updated);
    });
    updateStore && adapter.toggleNotifyForAccount(activeAccount, sub);
  };

  const getEventSubscriptionCount = async (): Promise<number> =>
    await adapter.getSubCount();

  const syncStored = async () => setSubscriptions(await adapter.getStored());

  const syncAccounts = async (accounts: FlattenedAccountData[]) => {
    const map = new Map<string, ChainEventSubscription[]>();
    for (const account of accounts) {
      const { address, chain: chainId } = account;
      const key = `${chainId}::${address}`;
      const active = await adapter.getStoredForAccount(account);
      const merged = getEventSubscriptionsForAccount(chainId, account).map(
        (a) => active.find((b) => cmp(a, b)) ?? a
      );
      map.set(key, merged);
    }
    setAccountSubscriptions(map);
  };

  const syncRefs = async () => {
    const rec = await adapter.getAllRefSubs();
    const chainIds = Object.keys(rec);

    setRefSubscriptions(() => {
      type T = Map<ChainID, Map<number, ChainEventSubscription[]>>;
      const next: T = new Map();
      for (const chainId of chainIds) {
        const mapRefs = new Map<number, ChainEventSubscription[]>();
        for (const [refId, active] of Object.entries(rec[chainId])) {
          const rid = parseInt(refId);
          const cid = chainId as ChainID;
          const merged = getEventSubscriptionsForRef(cid, rid).map((def) => {
            const found = active.find((a) => a.id === def.id);
            return found ? { ...found } : def;
          });
          mapRefs.set(parseInt(refId), merged);
        }
        next.set(chainId as ChainID, mapRefs);
      }
      return next;
    });
  };

  /**
   * Sync persisted referenda subscription state.
   */
  useEffect(() => {
    const sync = async () => {
      await syncRefs();
    };
    sync();
  }, []);

  /**
   * Listen to state messages from background worker.
   */
  useEffect(() => {
    const removeListener = adapter.listenOnMount(removeAllForAccount);
    return () => {
      removeListener && removeListener();
    };
  }, []);

  /**
   * Get chain subscriptions state from store and merge with defaults.
   */
  useEffect(() => {
    const fetch = async () => {
      if (!activeChain) {
        return;
      }
      const active = (await adapter.getStored()).get(activeChain) ?? [];
      setSubscriptions((prev) => {
        let subs: ChainEventSubscription[] = [];
        const pallets = ChainPallets[activeChain];
        for (const pallet of pallets) {
          subs = subs.concat(
            getEventSubscriptions(activeChain, pallet).map(
              (a) => active.find((b) => cmp(a, b)) ?? a
            )
          );
        }
        return new Map(prev).set(activeChain, subs);
      });
    };
    fetch();
  }, [activeChain]);

  /**
   * Get subscriptions state for the selected account.
   */
  useEffect(() => {
    const fetch = async () => {
      if (!activeAccount) {
        return;
      }
      // Get account's active subscriptions from store.
      const active: ChainEventSubscription[] =
        await adapter.getStoredForAccount(activeAccount);

      setAccountSubscriptions((prev) => {
        const { address, chain: chainId } = activeAccount;
        const subs = getEventSubscriptionsForAccount(
          chainId,
          activeAccount
        ).map((a) => active.find((b) => cmp(a, b)) ?? a);
        const key = `${chainId}::${address}`;
        return new Map(prev).set(key, subs);
      });
    };
    fetch();
  }, [activeAccount]);

  /**
   * Get referenda subscription state for selected chain.
   */
  useEffect(() => {
    const fetch = async () => {
      if (!activeRefChain) {
        return;
      }
      // Get active ref subscriptions from store.
      const activeIds = await adapter.getActiveRefIds(activeRefChain);
      const allActive = await adapter.getStoredRefSubsForChain(activeRefChain);
      const parseRefId = ({ id }: ChainEventSubscription): number =>
        parseInt(id.split('::')[1]);

      setRefSubscriptions((prev) => {
        const next = new Map(prev);
        const chainMap = new Map(next.get(activeRefChain) ?? new Map());
        for (const id of activeIds) {
          const active = allActive.filter((s) => parseRefId(s) === id);
          const merged = getEventSubscriptionsForRef(activeRefChain, id).map(
            (def) => {
              const found = active.find((a) => a.id === def.id);
              return found ? { ...found } : def;
            }
          );
          chainMap.set(id, merged);
        }
        next.set(activeRefChain, chainMap);
        return next;
      });
    };
    fetch();
  }, [activeRefChain]);

  return (
    <ChainEventsContext
      value={{
        activeChain,
        activeAccount,
        activeRefChain,
        refSubscriptions,
        subscriptions,
        accountHasSubs,
        accountSubCount,
        accountSubCountForPallet,
        addSubsForRef,
        countActiveRefSubs,
        getCategorisedForAccount,
        getCategorisedRefsForChain,
        getEventSubscriptionCount,
        refChainHasSubs,
        refActiveSubCount,
        removeAllForAccount,
        removeSubsForRef,
        setActiveAccount,
        setActiveChain,
        setActiveRefChain,
        syncAccounts,
        syncRefs,
        syncStored,
        toggle,
        toggleForAccount,
        toggleOsNotify,
      }}
    >
      {children}
    </ChainEventsContext>
  );
};
