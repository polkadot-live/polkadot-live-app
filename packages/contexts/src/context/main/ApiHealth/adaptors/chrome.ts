// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, ApiConnectResult } from '@polkadot-live/types';
import type { ApiError } from '@polkadot-live/core';
import type { ApiHealthAdaptor } from './types';
import type { ChainID } from '@polkadot-live/types/chains';

export const chromeAdapter: ApiHealthAdaptor = {
  onEndpointChange: async (chainId, endpoint) => {
    const meta = { chainId, endpoint };
    const data = { type: 'api', task: 'endpointChange', meta };
    await chrome.runtime.sendMessage(data);
  },

  onMount: (setFailedConnections) => {
    const callback = (message: AnyData) => {
      const { type, task } = message;
      if (type === 'api') {
        switch (task) {
          case 'state:failedConnections': {
            const { ser }: { ser: string } = message.payload;
            const array: [ChainID, ApiConnectResult<ApiError>][] =
              JSON.parse(ser);
            const map = new Map<ChainID, ApiConnectResult<ApiError>>(array);
            setFailedConnections(map);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },

  startApi: async (chainId) => {
    const msg = { type: 'api', task: 'startApi', chainId };
    await chrome.runtime.sendMessage(msg);
  },
};
