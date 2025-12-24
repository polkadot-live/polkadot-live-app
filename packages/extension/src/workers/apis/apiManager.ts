// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  ChainEventsService,
  SubscriptionsController,
  waitMs,
} from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NodeEndpoint } from '@polkadot-live/types/apis';

export const connectApis = async () => {
  if (!navigator.onLine) {
    return false;
  }
  const chainIds = [
    ...Array.from(AccountsController.accounts.keys()),
    ...Array.from(ChainEventsService.activeSubscriptions.keys()),
    ...Array.from(ChainEventsService.accountScopedSubscriptions.keys()),
  ];
  await Promise.all(chainIds.map((c) => startApi(c)));
  return true;
};

export const closeApi = async (chainId: ChainID) => {
  await APIsController.close(chainId);
};

export const startApi = async (chainId: ChainID) => {
  try {
    if (APIsController.failedCache.has(chainId)) {
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
    APIsController.reset(chainId);
    APIsController.syncChainConnections();
    console.error(error);
  }
};

export const onEndpointChange = async (
  chainId: ChainID,
  endpoint: NodeEndpoint
) => {
  await APIsController.setEndpoint(chainId, endpoint);
  await startApi(chainId);
};
