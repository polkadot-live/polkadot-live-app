// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { getChainEventAdapter } from './adapters';
import {
  ChainPallets,
  getEventSubscriptions,
  getEventSubscriptionsForAccount,
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
   * Active network and subscriptions.
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

  const accountSubCount = (account: FlattenedAccountData) =>
    adapter.getSubCountForAccount(account);

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
   * Handler to toggle a subscription.
   */
  const toggle = async (sub: ChainEventSubscription) => {
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

  /**
   * Handler to toggle OS notifications.
   */
  const toggleOsNotify = (sub: ChainEventSubscription, updateStore = true) => {
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

  /**
   * Get active subscriptions from store and merge with defaults.
   */
  useEffect(() => {
    const fetch = async () => {
      if (!activeChain) {
        setSubscriptions(new Map());
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
   * Get active subscriptions for the selected account.
   */
  useEffect(() => {
    const fetch = async () => {
      if (!activeAccount) {
        setAccountSubscriptions(new Map());
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
        subscriptions,
        accountSubCount,
        getCategorisedForAccount,
        getEventSubscriptionCount,
        removeAllForAccount,
        setActiveAccount,
        setActiveChain,
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
