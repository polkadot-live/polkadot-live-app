// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  ChainEventsService,
  runSequential,
  SubscriptionsController,
  withTimeout,
} from '@polkadot-live/core';
import pLimit from 'p-limit';
import type { NodeEndpoint } from '@polkadot-live/types/apis';
import type { ChainID } from '@polkadot-live/types/chains';

export const connectApis = async () => {
  if (!navigator.onLine) {
    return false;
  }
  const chainIds = [
    ...Array.from(AccountsController.accounts.keys()),
    ...Array.from(ChainEventsService.activeSubscriptions.keys()),
    ...Array.from(ChainEventsService.accountScopedSubscriptions.keys()),
  ].filter((chainId) => APIsController.getStatus(chainId) === 'disconnected');

  const limit = pLimit(2);
  await Promise.all(chainIds.map((c) => limit(() => startApi(c))));
  return true;
};

export const closeApi = async (chainId: ChainID) => {
  await APIsController.close(chainId);
};

export const startApi = async (chainId: ChainID) => {
  try {
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
      tasks.map((task) => () => withTimeout(task(), ms)),
    );

    // Reset API if any task timed out.
    if (results.some((ok) => !ok)) {
      APIsController.reset(chainId);
      return;
    }

    // Remove from failed connections.
    if (APIsController.failedCache.has(chainId)) {
      APIsController.failedCache.delete(chainId);
      APIsController.syncFailedConnections();
    }
  } catch (error) {
    APIsController.reset(chainId);
    APIsController.syncChainConnections();
    console.error(error);
  }
};

export const onEndpointChange = async (
  chainId: ChainID,
  endpoint: NodeEndpoint,
) => {
  await APIsController.setEndpoint(chainId, endpoint);
  await startApi(chainId);
};
