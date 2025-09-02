// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import {
  AccountsController,
  APIsController,
  SubscriptionsController,
} from '@polkadot-live/core';
import { createContext, use, useEffect, useState } from 'react';
import type { ApiConnectResult, NodeEndpoint } from '@polkadot-live/types/apis';
import type { ApiError } from '@polkadot-live/core';
import type { ApiHealthContextInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';

export const ApiHealthContext = createContext<ApiHealthContextInterface>(
  defaults.defaultApiHealthContext
);

export const useApiHealth = () => use(ApiHealthContext);

export const ApiHealthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [failedConnections, setFailedConnections] = useState(
    new Map<ChainID, ApiConnectResult<ApiError>>()
  );

  /**
   * Returns `true` if the chain is currently unavailable due to a failed connection attempt.
   */
  const hasConnectionIssue = (chainId: ChainID): boolean =>
    Array.from(failedConnections.keys()).includes(chainId);

  /**
   * Attempt connecting to a chain API.
   */
  const startApi = async (chainId: ChainID) => {
    const { ack } = await APIsController.connectApi(chainId);

    if (ack === 'success') {
      await onApiRecover(chainId);
    }
  };

  /**
   * Handle settings a new chain RPC endpoint.
   */
  const onEndpointChange = async (chainId: ChainID, endpoint: NodeEndpoint) => {
    await APIsController.setEndpoint(chainId, endpoint);
    await startApi(chainId);
    SubscriptionsController.syncState();
  };

  /**
   * Handle a recovered chain API connection.
   */
  const onApiRecover = async (chainId: ChainID) => {
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

  /**
   * Cache React setter in APIs controller.
   */
  useEffect(() => {
    APIsController.setFailedConnections = setFailedConnections;
  }, []);

  return (
    <ApiHealthContext
      value={{
        failedConnections,
        hasConnectionIssue,
        onEndpointChange,
        setFailedConnections,
        startApi,
      }}
    >
      {children}
    </ApiHealthContext>
  );
};
