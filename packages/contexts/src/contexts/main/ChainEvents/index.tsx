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

  const addSubsForRef = (
    chainId: ChainID,
    refId: number
  ): ChainEventSubscription[] => {
    let updated: ChainEventSubscription[] = [];
    setRefSubscriptions((prev) => {
      type T = Map<number, ChainEventSubscription[]>;
      const map: T = prev.get(chainId) ?? new Map();
      const subs = getEventSubscriptionsForRef(chainId, refId);
      updated = [...subs];
      const newMap = new Map(map).set(refId, updated);
      return new Map(prev).set(chainId, newMap);
    });
    return updated.filter(({ enabled }) => enabled);
  };

  const removeSubsForRef = (
    chainId: ChainID,
    refId: number
  ): ChainEventSubscription[] => {
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
      // Otherwise, update the chain's map
      return new Map(prev).set(chainId, newMap);
    });
    return removed.filter(({ enabled }) => enabled);
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
      case 'referendum':
        break;
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
        break;
    }
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
      const allActive = await adapter.getStoredRefSubsForChain(activeRefChain);
      if (allActive.length === 0) {
        return;
      }

      const parseRefId = ({ id }: ChainEventSubscription): number =>
        parseInt(id.split('::')[1]);
      const activeIds = new Set(allActive.map((s) => parseRefId(s)));

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

  /**
   * Listen to state messages from background worker.
   */
  useEffect(() => {
    const removeListener = adapter.listenOnMount(removeAllForAccount);
    return () => {
      removeListener && removeListener();
    };
  }, []);

  return (
    <ChainEventsContext
      value={{
        activeChain,
        activeAccount,
        refSubscriptions,
        subscriptions,
        accountHasSubs,
        accountSubCount,
        accountSubCountForPallet,
        addSubsForRef,
        getCategorisedForAccount,
        getCategorisedRefsForChain,
        getEventSubscriptionCount,
        removeAllForAccount,
        removeSubsForRef,
        setActiveAccount,
        setActiveChain,
        setActiveRefChain,
        syncAccounts,
        syncStored,
        toggle,
        toggleForAccount,
        toggleOsNotify,
        toggleOsNotifyForAccount,
      }}
    >
      {children}
    </ChainEventsContext>
  );
};
