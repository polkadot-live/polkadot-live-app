// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getApiHealthAdapter } from './adaptors';
import type { ApiConnectResult, NodeEndpoint } from '@polkadot-live/types/apis';
import type { ApiError } from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ApiHealthContextInterface } from '../../../types/main';

export const ApiHealthContext = createContext<
  ApiHealthContextInterface | undefined
>(undefined);

export const useApiHealth = createSafeContextHook(
  ApiHealthContext,
  'ApiHealthContext'
);

export const ApiHealthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adaptor = getApiHealthAdapter();
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
  const startApi = async (chainId: ChainID) =>
    await adaptor.startApi(chainId, failedConnections);

  /**
   * Handle settings a new chain RPC endpoint.
   */
  const onEndpointChange = async (chainId: ChainID, endpoint: NodeEndpoint) =>
    await adaptor.onEndpointChange(chainId, endpoint);

  /**
   * Listen for react state tasks from background worker.
   */
  useEffect(() => {
    const removeListener = adaptor.onMount(setFailedConnections);
    return () => {
      removeListener && removeListener();
    };
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
