// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getReferendaSubscriptionsAdapter } from './adapters';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { ReferendaSubscriptionsContextInterface } from '../../../types/openGov';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';

export const ReferendaSubscriptionsContext = createContext<
  ReferendaSubscriptionsContextInterface | undefined
>(undefined);

export const useReferendaSubscriptions = createSafeContextHook(
  ReferendaSubscriptionsContext,
  'ReferendaSubscriptionsContext'
);

export const ReferendaSubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getReferendaSubscriptionsAdapter();

  // Cached referenda subscriptions.
  const [subscriptions, setSubscriptions] = useState<
    Map<ChainID, IntervalSubscription[]>
  >(new Map());

  // Map to identify referenda added to main window.
  const [addedRefsMap, setAddedRefsMap] = useState(
    new Map<ChainID, number[] /* refIds */>()
  );

  const removeRef = (chainId: ChainID, refId: number) => {
    setSubscriptions((prev) => {
      const cur = prev.get(chainId) ?? [];
      const updated = cur.filter((s) => s.referendumId !== refId);
      updated.length ? prev.set(chainId, updated) : prev.delete(chainId);
      return new Map(prev);
    });
    setAddedRefsMap((prev) => {
      const cur = prev.get(chainId) ?? [];
      const updated = cur.filter((id) => id !== refId);
      updated.length ? prev.set(chainId, updated) : prev.delete(chainId);
      return new Map(prev);
    });
  };

  // Add a task to the context.
  const addReferendaSubscription = (task: IntervalSubscription) => {
    setSubscriptions((prev) => {
      const { chainId } = task;
      const cloned = new Map(prev);
      cloned.has(chainId)
        ? cloned.set(chainId, [...cloned.get(chainId)!, task])
        : cloned.set(chainId, [task]);

      return cloned;
    });

    setAddedRefsMap((prev) => {
      const { chainId, referendumId: refId } = task;
      const next = (prev.get(chainId) || []).filter((id) => id !== refId);
      refId && next.push(refId);
      return new Map(prev).set(chainId, next);
    });
  };

  // Remove a task from the context.
  const removeReferendaSubscription = (task: IntervalSubscription) => {
    // Update subscriptions map.
    setSubscriptions((prev) => {
      const { chainId, action, referendumId } = task;
      const cloned = new Map(prev);
      if (cloned.has(chainId)) {
        const cached = cloned.get(chainId)!;
        cached.length === 1
          ? cloned.delete(chainId)
          : cloned.set(
              chainId,
              cloned
                .get(chainId)!
                .filter(
                  (t) =>
                    !(t.action === action && t.referendumId === referendumId)
                )
            );
      }
      return cloned;
    });

    setAddedRefsMap((prev) => {
      const { chainId, referendumId: refId } = task;
      const next = new Map(prev);
      const updated = (next.get(chainId) || []).filter((id) => id !== refId);
      updated.length > 0 ? next.set(chainId, updated) : next.delete(chainId);
      return next;
    });
  };

  // Check if a task has been added for a referendum.
  const isAdded = (referendum: ReferendaInfo, chainId: ChainID) => {
    const { refId } = referendum;
    return (addedRefsMap.get(chainId) || []).includes(refId);
  };

  // Update data of a managed task.
  const updateReferendaSubscription = (task: IntervalSubscription) => {
    setSubscriptions((prev) => {
      const { action, chainId, referendumId: refId } = task;
      const cloned = new Map(prev);
      if (!cloned.has(chainId)) {
        cloned.set(chainId, []);
      }
      const updated = cloned
        .get(chainId)!
        .filter((t) => !(t.action === action && t.referendumId === refId))
        .concat([task]);
      cloned.set(chainId, updated);
      return cloned;
    });
  };

  // Fetch interval subscriptions from store and initialize state on mount.
  useEffect(() => {
    adapter.fetchOnMount().then((result) => {
      if (result) {
        result.forEach((t) => addReferendaSubscription(t));
      }
    });
  }, []);

  // Listen for messages from popup.
  useEffect(() => {
    const removeListener = adapter.listenOnMount(
      addReferendaSubscription,
      removeReferendaSubscription,
      updateReferendaSubscription
    );
    return () => {
      removeListener && removeListener();
    };
  }, []);

  return (
    <ReferendaSubscriptionsContext
      value={{
        subscriptions,
        addReferendaSubscription,
        isAdded,
        removeRef,
        removeReferendaSubscription,
        setSubscriptions,
        updateReferendaSubscription,
      }}
    >
      {children}
    </ReferendaSubscriptionsContext>
  );
};
