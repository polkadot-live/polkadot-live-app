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
  const addAllIntervalSubscriptions = (
    chainId: ChainID,
    refInfo: ReferendaInfo
  ) => {
    const { refId } = refInfo;
    const all = getIntervalSubscriptions(chainId, refInfo);
    const updated = all.map(
      (t) =>
        ({
          ...t,
          status: 'enable',
          referendumId: refId,
        }) as IntervalSubscription
    );
    // Cache task data in referenda subscriptions context.
    for (const task of updated) {
      addReferendaSubscription({ ...task });
    }
    adapter.addIntervalSubscriptionsMessage(refId, updated, getOnlineMode());
    const text = `Subscriptions added for referendum ${refId}.`;
    const toastId = `add-all-${chainId}-${refId}`;
    renderToast(text, toastId, 'success');
    adapter.handleAnalytics('referenda-subscribe-all', null);
  };

  // Handles removing all addde subscriptions for a referendum.
  const removeAllIntervalSubscriptions = (
    chainId: ChainID,
    refInfo: ReferendaInfo
  ) => {
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
    // Cache task data in referenda subscriptions context.
    for (const task of updated) {
      removeReferendaSubscription({ ...task });
    }
    adapter.removeIntervalSubscriptionsMessage(refId, updated, getOnlineMode());
    const text = `Subscriptions removed for referendum ${refId}.`;
    const toastId = `remove-all-${chainId}-${refId}`;
    renderToast(text, toastId, 'success');
    adapter.handleAnalytics('referenda-unsubscribe-all', null);
  };

  return (
    <TaskHandlerContext
      value={{
        addAllIntervalSubscriptions,
        removeAllIntervalSubscriptions,
      }}
    >
      {children}
    </TaskHandlerContext>
  );
};
