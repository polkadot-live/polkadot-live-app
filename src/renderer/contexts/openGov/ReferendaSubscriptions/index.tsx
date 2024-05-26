// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { ChainID } from '@/types/chains';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type { ReferendaSubscriptionsContextInterface } from './types';

export const ReferendaSubscriptionsContext =
  createContext<ReferendaSubscriptionsContextInterface>(
    defaults.defaultReferendaSubscriptionsContext
  );

export const useReferendaSubscriptions = () =>
  useContext(ReferendaSubscriptionsContext);

export const ReferendaSubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Cached referenda subscriptions.
  const [subscriptions, setSubscriptions] = useState<
    Map<ChainID, IntervalSubscription[]>
  >(new Map());

  /// Map to identify active subscriptions for individual referenda.
  /// Key is referendum ID, value is array of subscription tasks.
  const [activeTasksMap, setActiveTasksMap] = useState<Map<number, string[]>>(
    new Map()
  );

  return (
    <ReferendaSubscriptionsContext.Provider
      value={{
        subscriptions,
        setSubscriptions,
        activeTasksMap,
        setActiveTasksMap,
      }}
    >
      {children}
    </ReferendaSubscriptionsContext.Provider>
  );
};
