// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { getChainEventAdapter } from './adapters';
import {
  ChainPallets,
  getEventSubscriptions,
} from '@polkadot-live/consts/subscriptions/chainEvents';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ChainEventSubscription } from '@polkadot-live/types';
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
   * Compare utility.
   */
  const cmp = (a: ChainEventSubscription, b: ChainEventSubscription) =>
    a.pallet === b.pallet && a.eventName === b.eventName;

  /**
   * Handler to toggle a subscription.
   */
  const toggle = async (subscription: ChainEventSubscription) => {
    if (!activeChain) {
      return;
    }
    const status = !subscription.enabled;
    subscription.enabled = status;

    setSubscriptions((prev) => {
      const existing = prev.get(activeChain) ?? [];
      const updated = existing
        .filter((s) => !cmp(s, subscription))
        .concat(subscription);
      return new Map(prev).set(activeChain, updated);
    });

    status
      ? adapter.storeInsert(activeChain, subscription)
      : adapter.storeRemove(activeChain, subscription);
  };

  /**
   * Handler to toggle OS notifications.
   */
  const toggleOsNotify = (sub: ChainEventSubscription, updateStore = true) => {
    if (!activeChain) {
      return;
    }
    const osNofify = !sub.osNotify;
    sub.osNotify = osNofify;

    setSubscriptions((prev) => {
      const existing = prev.get(activeChain) ?? [];
      const updated = existing.map((s) => (cmp(s, sub) ? sub : s));
      return new Map(prev).set(activeChain, updated);
    });

    if (updateStore) {
      adapter.toggleNotify(activeChain, sub);
    }
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

  return (
    <ChainEventsContext
      value={{
        activeChain,
        subscriptions,
        getEventSubscriptionCount,
        setActiveChain,
        toggle,
        toggleOsNotify,
      }}
    >
      {children}
    </ChainEventsContext>
  );
};
