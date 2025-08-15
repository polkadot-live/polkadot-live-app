// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import {
  AccountsController,
  APIsController,
  SubscriptionsController,
} from '@polkadot-live/core';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ApiConnectResult, NodeEndpoint } from '@polkadot-live/types/apis';
import type { ApiError } from '@polkadot-live/core';
import type { ApiHealthContextInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';

export const ApiHealthContext = createContext<ApiHealthContextInterface>(
  defaults.defaultApiHealthContext
);

export const useApiHealth = () => useContext(ApiHealthContext);

export const ApiHealthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [failedConnections, setFailedConnections] = useState(
    new Map<ChainID, ApiConnectResult<ApiError>>()
  );

  /**
   * Attempt connecting to a chain API.
   */
  const startApi = async (chainId: ChainID) => {
    const { ack } = await APIsController.connectApi(chainId);

    // Handle a potential connection recovery.
    if (ack === 'success' && failedConnections.has(chainId)) {
      await onApiRecover(chainId);
    }
  };

  /**
   * Handle settings a new chain RPC endpoint.
   */
  const onEndpointChange = async (chainId: ChainID, endpoint: NodeEndpoint) => {
    const { ack } = await APIsController.connectEndpoint(chainId, endpoint);

    // Re-subscribe account and chain tasks.
    if (ack == 'success') {
      await Promise.all([
        AccountsController.subscribeAccountsForChain(chainId),
        SubscriptionsController.resubscribeChain(chainId),
      ]);
    }

    SubscriptionsController.syncState();
  };

  /**
   * Handle a recovered chain API connection.
   */
  const onApiRecover = async (chainId: ChainID) => {
    APIsController.failedCache.delete(chainId);
    APIsController.syncFailedConnections();

    // Resync accounts and start subscriptions.
    const res = await APIsController.getConnectedApiOrThrow(chainId);
    const api = res.getApi();

    await AccountsController.syncAllAccounts(api, chainId);
    await AccountsController.subscribeAccountsForChain(chainId);
    await SubscriptionsController.resubscribeChain(chainId);
  };

  /**
   * Cache React setter in APIs controller.
   */
  useEffect(() => {
    APIsController.setFailedConnections = setFailedConnections;
  }, []);

  return (
    <ApiHealthContext.Provider
      value={{
        failedConnections,
        onEndpointChange,
        setFailedConnections,
        startApi,
      }}
    >
      {children}
    </ApiHealthContext.Provider>
  );
};
