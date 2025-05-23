// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ManageContextInterface } from './types';

// Default context value.
export const defaultManageContext: ManageContextInterface = {
  renderedSubscriptions: { type: '', tasks: [] },
  dynamicIntervalTasksState: [],
  activeChainId: null,
  setActiveChainId: () => {},
  setDynamicIntervalTasks: () => {},
  setRenderedSubscriptions: () => {},
  updateRenderedSubscriptions: () => {},
  tryUpdateDynamicIntervalTask: () => {},
  tryAddIntervalSubscription: (t) => {},
  tryRemoveIntervalSubscription: (t) => {},
  getCategorisedDynamicIntervals: () => new Map(),
};
