// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  SubscriptionsController,
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
    if (!failedConnections) {
      return;
    }

    const onApiRecover = async () => {
      try {
        if (failedConnections.has(chainId)) {
          APIsController.failedCache.delete(chainId);
          APIsController.syncFailedConnections();
        }
        // Resync accounts and start subscriptions.
        const res = await APIsController.getConnectedApiOrThrow(chainId);
        const api = res.getApi();

        await AccountsController.syncAllAccounts(api, chainId);
        await Promise.all([
          AccountsController.subscribeAccountsForChain(chainId),
          SubscriptionsController.resubscribeChain(chainId),
        ]);
      } catch (error) {
        console.error(error);
      }
    };

    const { ack } = await APIsController.connectApi(chainId);
    if (ack === 'success') {
      await onApiRecover();
    }
  },
};
