// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsService } from '@polkadot-live/core';
import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { getChainEventAdapter } from './adapters';
import { getEventSubscriptions } from '@polkadot-live/consts/subscriptions/chainEvents';
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

    if (status) {
      adapter.storeInsert(activeChain, subscription);
      ChainEventsService.insert(activeChain, subscription);
      await ChainEventsService.initEventStream(activeChain);
    } else {
      adapter.storeRemove(activeChain, subscription);
      ChainEventsService.remove(activeChain, subscription);
      ChainEventsService.tryStopEventsStream(activeChain);
    }
  };

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
      setSubscriptions((prev) =>
        new Map(prev).set(
          activeChain,
          getEventSubscriptions(activeChain, 'Referenda').map(
            (a) => active.find((b) => cmp(a, b)) ?? a
          )
        )
      );
    };
    fetch();
  }, [activeChain]);

  return (
    <ChainEventsContext
      value={{
        activeChain,
        subscriptions,
        setActiveChain,
        setSubscriptions,
        toggle,
      }}
    >
      {children}
    </ChainEventsContext>
  );
};
