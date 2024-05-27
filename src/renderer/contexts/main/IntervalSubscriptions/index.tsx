// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { ChainID } from '@/types/chains';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type { IntervalSubscriptionsContextInterface } from './types';

export const IntervalSubscriptionsContext =
  createContext<IntervalSubscriptionsContextInterface>(
    defaults.defaultIntervalSubscriptionsContext
  );

export const useIntervalSubscriptions = () =>
  useContext(IntervalSubscriptionsContext);

export const IntervalSubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Active interval subscriptions.
  const [subscriptions, setSubscriptions] = useState<
    Map<ChainID, IntervalSubscription[]>
  >(new Map());

  return (
    <IntervalSubscriptionsContext.Provider
      value={{ subscriptions, setSubscriptions }}
    >
      {children}
    </IntervalSubscriptionsContext.Provider>
  );
};
