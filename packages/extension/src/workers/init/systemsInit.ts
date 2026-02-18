// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  ChainEventsService,
  IntervalsController,
} from '@polkadot-live/core';
import { connectApis, startApi } from '../apis';
import { eventBus } from '../eventBus';
import { setSharedState, setSystemsInitialized } from '../state';
import { setAccountSubscriptionsState } from '../subscriptions';
import { initManagedAccounts } from './accountsInit';
import { initAPIs } from './apisInit';
import { initOnlineMode, initTheme } from './environmentInit';
import {
  initAccountSubscriptions,
  initChainSubscriptions,
  initEventSubscriptions,
  initIntervalSubscriptions,
  startEventStreams,
} from './subscriptionsInit';

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
  const chainIds = [
    ...Array.from(AccountsController.accounts.keys()),
    ...Array.from(ChainEventsService.activeSubscriptions.keys()),
    ...Array.from(ChainEventsService.accountScopedSubscriptions.keys()),
  ];
  for (const chainId of chainIds) {
    await startApi(chainId);
  }
  // Re-start interval clock.
  IntervalsController.initIntervals(true);
  // Restart event streams.
  await initEventSubscriptions();
  await startEventStreams();
  // Sync subscription state.
  await setAccountSubscriptionsState();
};
