// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { intervalTasks } from '@polkadot-live/consts/subscriptions/interval';
import { createContext } from 'react';
import { getTaskHandlerAdapter } from './adapters';
import { createSafeContextHook, renderToast } from '../../../utils';
import { useConnections } from '../../common';
import { useReferendaSubscriptions } from '../ReferendaSubscriptions';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { ReferendaInfo, RefStatus } from '@polkadot-live/types/openGov';
import type { TaskHandlerContextInterface } from '../../../types/openGov';

export const TaskHandlerContext = createContext<
  TaskHandlerContextInterface | undefined
>(undefined);

export const useTaskHandler = createSafeContextHook(
  TaskHandlerContext,
  'TaskHandlerContext'
);

export const TaskHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getTaskHandlerAdapter();
  const { getOnlineMode } = useConnections();
  const { addReferendaSubscription, removeReferendaSubscription } =
    useReferendaSubscriptions();

  const getIntervalSubscriptions = (
    chainId: ChainID,
    refInfo: ReferendaInfo
  ) => {
    const { refStatus } = refInfo;
    return intervalTasks
      .filter((t) => t.chainId === chainId)
      .filter((t) => {
        if ((['Preparing', 'Queueing'] as RefStatus[]).includes(refStatus)) {
          const actions = ['subscribe:interval:openGov:referendumVotes'];
          return actions.includes(t.action);
        } else {
          return true;
        }
      });
  };

  // Handles adding all available subscriptions for a referendum.
  const addSubscriptions = (chainId: ChainID, refInfo: ReferendaInfo) => {
    const { refId } = refInfo;
    const all = getIntervalSubscriptions(chainId, refInfo);
    const updated = all.map(
      (t) => ({ ...t, referendumId: refId }) as IntervalSubscription
    );
    // Cache task data in context.
    const isOnline = getOnlineMode();
    updated.forEach((t) => addReferendaSubscription({ ...t }));
    adapter.addReferendumSubscriptions(refId, updated, isOnline, chainId);
    adapter.handleAnalytics('referenda-subscribe-all', null);
    renderToast(
      `Subscriptions added for referendum ${refId}.`,
      `add-all-${chainId}-${refId}`,
      'success'
    );
  };

  // Handles removing all subscriptions for a referendum.
  const removeSubscriptions = (chainId: ChainID, refInfo: ReferendaInfo) => {
    const { refId } = refInfo;
    const all = getIntervalSubscriptions(chainId, refInfo);
    const updated = all.map(
      (t) =>
        ({
          ...t,
          status: 'disable',
          referendumId: refId,
        }) as IntervalSubscription
    );
    // Cache task data in context.
    const isOnline = getOnlineMode();
    updated.forEach((t) => removeReferendaSubscription({ ...t }));
    adapter.removeReferendumSubscriptions(refId, updated, isOnline, chainId);
    adapter.handleAnalytics('referenda-unsubscribe-all', null);
    renderToast(
      `Subscriptions removed for referendum ${refId}.`,
      `remove-all-${chainId}-${refId}`,
      'success'
    );
  };

  return (
    <TaskHandlerContext
      value={{
        addSubscriptions,
        removeSubscriptions,
      }}
    >
      {children}
    </TaskHandlerContext>
  );
};
