// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ApiConnectResult, NodeEndpoint } from '@polkadot-live/types/apis';
import type { ApiError } from '@polkadot-live/core';
import type { ApiHealthContextInterface } from './types';
import type { ChainID } from '@polkadot-live/types/chains';

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
    const data = { type: 'api', task: 'startApi', chainId };
    await chrome.runtime.sendMessage(data);
  };

  /**
   * Handle settings a new chain RPC endpoint.
   */
  const onEndpointChange = async (chainId: ChainID, endpoint: NodeEndpoint) => {
    const meta = { chainId, endpoint };
    const data = { type: 'api', task: 'endpointChange', meta };
    await chrome.runtime.sendMessage(data);
  };

  /**
   * Listen for react state tasks from background worker.
   */
  useEffect(() => {
    const callback = (message: AnyData) => {
      const { type, task } = message;
      if (type === 'api' && task === 'state:failedConnections') {
        const { ser }: { ser: string } = message;
        const array: [ChainID, ApiConnectResult<ApiError>][] = JSON.parse(ser);
        const map = new Map<ChainID, ApiConnectResult<ApiError>>(array);
        setFailedConnections(map);
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
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
