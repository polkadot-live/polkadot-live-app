// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ManageContextInterface } from './types';

// Default context value.
export const defaultManageContext: ManageContextInterface = {
  renderedSubscriptions: { type: '', tasks: [] },
  dynamicIntervalTasksState: [],
  activeChainId: null,
  setDynamicIntervalTasks: () => {},
  setRenderedSubscriptions: () => {},
  updateRenderedSubscriptions: () => {},
  updateDynamicIntervalTask: () => {},
  setActiveChainId: () => {},
  tryAddIntervalSubscription: (t) => {},
  tryRemoveIntervalSubscription: (t) => {},
  getCategorizedDynamicIntervals: () => new Map(),
};
