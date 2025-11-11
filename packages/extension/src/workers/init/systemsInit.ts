// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  disconnectAPIs,
  IntervalsController,
} from '@polkadot-live/core';
import { connectApis, startApi } from '../apis';
import { eventBus } from '../eventBus';
import { initAPIs } from './apisInit';
import { initManagedAccounts } from './accountsInit';
import { initOnlineMode, initTheme } from './environmentInit';
import { setSharedState, setSystemsInitialized } from '../state';
import {
  initAccountSubscriptions,
  initChainSubscriptions,
  initIntervalSubscriptions,
} from './subscriptionsInit';
import { setAccountSubscriptionsState } from '../subscriptions';

export const initSystems = async () => {
  await initOnlineMode();
  await Promise.all([initTheme(), initManagedAccounts(), initAPIs()]);
  await connectApis();
  await initAccountSubscriptions();
  await initChainSubscriptions();
  initIntervalSubscriptions();
  eventBus.dispatchEvent(new CustomEvent('initSystems:complete'));
  setSystemsInitialized(true);
  await disconnectAPIs();
};

export const handleSwitchToOffline = async () => {
  setSharedState('mode:connected', navigator.onLine);
  setSharedState('mode:online', false);
  IntervalsController.stopInterval();
  await APIsController.closeAll();
};

export const handleSwitchToOnline = async () => {
  setSharedState('mode:connected', navigator.onLine);
  setSharedState('mode:online', navigator.onLine);
  // Re-connect APIs.
  const chainIds = Array.from(AccountsController.accounts.keys());
  await Promise.all(chainIds.map((c) => startApi(c)));
  // Re-start interval clock.
  IntervalsController.initIntervals(true);
  // Sync subscription state.
  await setAccountSubscriptionsState();
};
