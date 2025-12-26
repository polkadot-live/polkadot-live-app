// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  runSequential,
  SubscriptionsController,
  withTimeout,
} from '@polkadot-live/core';
import type { ApiHealthAdapter } from './types';

export const electronAdapter: ApiHealthAdapter = {
  onEndpointChange: async (chainId, endpoint) => {
    await APIsController.setEndpoint(chainId, endpoint);
    await electronAdapter.startApi(chainId);
    SubscriptionsController.syncState();
  },

  onMount: (setFailedConnections) => {
    APIsController.setFailedConnections = setFailedConnections;
    return null;
  },

  startApi: async (chainId, failedConnections) => {
    try {
      if (!failedConnections) {
        return;
      }
      if (failedConnections.has(chainId)) {
        APIsController.failedCache.delete(chainId);
        APIsController.syncFailedConnections();
      }
      // Resync accounts and start subscriptions.
      const res = await APIsController.getConnectedApiOrThrow(chainId);
      const api = res.getApi();

      // Prepare syncing tasks.
      const ms = APIsController.getConnectionTimeout(chainId);
      const tasks = [
        () => AccountsController.syncAllAccounts(api, chainId),
        () => AccountsController.subscribeAccountsForChain(chainId),
        () => SubscriptionsController.resubscribeChain(chainId),
      ];

      // Run tasks sequentially.
      const results = await runSequential<boolean>(
        tasks.map((task) => () => withTimeout(task(), ms))
      );

      // Reset API if any task timed out.
      if (results.some((ok) => !ok)) {
        APIsController.reset(chainId);
      }
    } catch (error) {
      console.error(error);
      APIsController.reset(chainId);
    }
  },
};
