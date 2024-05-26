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

  return (
    <ReferendaSubscriptionsContext.Provider
      value={{ subscriptions, setSubscriptions }}
    >
      {children}
    </ReferendaSubscriptionsContext.Provider>
  );
};
