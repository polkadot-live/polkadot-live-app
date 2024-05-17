// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { SubscriptionsContextInterface } from './types';

export const defaultSubscriptionsContext: SubscriptionsContextInterface = {
  chainSubscriptions: new Map(),
  accountSubscriptions: new Map(),
  setChainSubscriptions: () => {},
  getChainSubscriptions: () => [],
  setAccountSubscriptions: () => {},
  getAccountSubscriptions: () => [],
  updateTask: () => {},
  updateAccountNameInTasks: () => {},
  handleQueuedToggle: async (c, f) => {
    await new Promise(() => {});
  },
  toggleCategoryTasks: async (c, i, ts, u) => {
    await new Promise(() => {});
  },
  getTaskType: (t) => '',
};
