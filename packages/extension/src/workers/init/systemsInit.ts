// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { connectApis } from '../apis';
import { eventBus } from '../eventBus';
import { initAPIs } from './apisInit';
import { initManagedAccounts } from './accountsInit';
import { initOnlineMode, initTheme } from './environmentInit';
import { setSystemsInitialized } from '../state';
import {
  initAccountSubscriptions,
  initChainSubscriptions,
  initIntervalSubscriptions,
} from './subscriptionsInit';

export const initSystems = async () => {
  await initOnlineMode();
  await Promise.all([initTheme(), initManagedAccounts(), initAPIs()]);
  await connectApis();
  await initAccountSubscriptions();
  await initChainSubscriptions();
  initIntervalSubscriptions();
  eventBus.dispatchEvent(new CustomEvent('initSystems:complete'));
  setSystemsInitialized(true);
};
