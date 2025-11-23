// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  ChainEventsService,
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
  initEventSubscriptions,
  initIntervalSubscriptions,
  startEventStreams,
} from './subscriptionsInit';
import { setAccountSubscriptionsState } from '../subscriptions';

export const initSystems = async () => {
  await initOnlineMode();
  await initAPIs();
  await Promise.all([
    initTheme(),
    initManagedAccounts(),
    initEventSubscriptions(),
  ]);
  await connectApis();
  await initAccountSubscriptions();
  await initChainSubscriptions();
  initIntervalSubscriptions();
  await startEventStreams();
  eventBus.dispatchEvent(new CustomEvent('initSystems:complete'));
  setSystemsInitialized(true);
  await disconnectAPIs();
};

export const handleSwitchToOffline = async () => {
  setSharedState('mode:connected', navigator.onLine);
  setSharedState('mode:online', false);
  IntervalsController.stopInterval();
  ChainEventsService.stopAllEventStreams();
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
  // Restart event streams.
  await initEventSubscriptions();
  await startEventStreams();
  // Sync subscription state.
  await setAccountSubscriptionsState();
};
