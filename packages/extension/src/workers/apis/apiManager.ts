// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  SubscriptionsController,
} from '@polkadot-live/core';
import { isSystemsInitialized } from '../state';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NodeEndpoint } from '@polkadot-live/types/apis';

export const connectApis = async () => {
  if (isSystemsInitialized()) {
    return;
  }
  if (!navigator.onLine) {
    return false;
  }
  const chainIds = Array.from(AccountsController.accounts.keys());
  await Promise.all(chainIds.map((c) => startApi(c)));
  return true;
};

export const closeApi = async (chainId: ChainID) => {
  await APIsController.close(chainId);
};

export const startApi = async (chainId: ChainID) => {
  const { ack } = await APIsController.connectApi(chainId);
  if (ack === 'success') {
    await onApiRecover(chainId);
  }
};

export const onApiRecover = async (chainId: ChainID) => {
  try {
    if (APIsController.failedCache.has(chainId)) {
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

export const onEndpointChange = async (
  chainId: ChainID,
  endpoint: NodeEndpoint
) => {
  await APIsController.setEndpoint(chainId, endpoint);
  await startApi(chainId);
  SubscriptionsController.syncState();
};
