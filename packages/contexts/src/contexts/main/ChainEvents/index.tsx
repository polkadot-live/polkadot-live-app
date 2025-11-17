// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsService } from '@polkadot-live/core';
import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
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
      const filtered =
        prev.get(activeChain)?.filter((s) => !cmp(s, subscription)) ?? [];
      return new Map(prev).set(activeChain, [...filtered, subscription]);
    });

    if (status) {
      ChainEventsService.insert(activeChain, subscription);
      await ChainEventsService.initEventStream(activeChain);
    } else {
      ChainEventsService.remove(activeChain, subscription);
      ChainEventsService.tryStopEventsStream(activeChain);
    }
  };

  /**
   * Load subscriptions when active chain changes.
   */
  useEffect(() => {
    // Get active subscriptions from store and merge with defaults.
    !activeChain
      ? setSubscriptions(new Map())
      : setSubscriptions((prev) => {
          const active = subscriptions.get(activeChain) ?? [];
          return new Map(prev).set(
            activeChain,
            getEventSubscriptions(activeChain, 'Referenda').map((a) => {
              const s = active.find((b) => cmp(a, b));
              return s ?? a;
            })
          );
        });
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
