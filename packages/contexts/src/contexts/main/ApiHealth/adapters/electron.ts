// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  SubscriptionsController,
  waitMs,
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

      const sync = async () => {
        await AccountsController.syncAllAccounts(api, chainId);
        await AccountsController.subscribeAccountsForChain(chainId);
        await SubscriptionsController.resubscribeChain(chainId);
      };
      const timeout = APIsController.getConnectionTimeout(chainId);
      const success = await Promise.race([
        waitMs(timeout).then(() => false),
        sync().then(() => true),
      ]);

      if (!success) {
        APIsController.reset(chainId);
      }
    } catch (error) {
      console.error(error);
      APIsController.reset(chainId);
    }
  },
};
