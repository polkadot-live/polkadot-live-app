// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ReferendaSubscriptionsContextInterface } from './types';

export const defaultReferendaSubscriptionsContext: ReferendaSubscriptionsContextInterface =
  {
    subscriptions: new Map(),
    setSubscriptions: () => {},
    activeTasksMap: new Map(),
    addReferendaSubscription: (t) => {},
    removeReferendaSubscription: (t) => {},
    updateReferendaSubscription: (t) => {},
    isSubscribedToTask: () => true,
    isSubscribedToReferendum: () => false,
    isNotSubscribedToAny: (c) => true,
  };
