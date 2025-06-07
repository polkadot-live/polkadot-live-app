// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { SubscriptionsContextInterface } from './types';

export const defaultSubscriptionsContext: SubscriptionsContextInterface = {
  chainSubscriptions: new Map(),
  accountSubscriptions: new Map(),
  chainHasSubscriptions: () => false,
  getChainSubscriptions: () => [],
  getAccountSubscriptions: () => [],
  updateAccountNameInTasks: () => {},
  handleQueuedToggle: async (c) => {
    await new Promise(() => {});
  },
  toggleCategoryTasks: async (c, i, ts) => {
    await new Promise(() => {});
  },
  getTaskType: (t) => '',
};
