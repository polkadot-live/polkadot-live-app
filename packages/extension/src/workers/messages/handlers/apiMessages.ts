// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '@polkadot-live/core';
import { closeApi, onEndpointChange, startApi } from '../../apis';
import type { NodeEndpoint } from '@polkadot-live/types/apis';
import type { ChainID } from '@polkadot-live/types/chains';
import type { AnyData } from '@polkadot-live/types/misc';

export const handleApiMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'startApi': {
      const { chainId }: { chainId: ChainID } = message;
      startApi(chainId).then(() => sendResponse(true));
      return true;
    }
    case 'closeApi': {
      const { chainId }: { chainId: ChainID } = message;
      closeApi(chainId).then(() => sendResponse(true));
      return true;
    }
    case 'endpointChange': {
      const {
        chainId,
        endpoint,
      }: { chainId: ChainID; endpoint: NodeEndpoint } = message.meta;
      onEndpointChange(chainId, endpoint).then(() => sendResponse(true));
      return true;
    }
    case 'syncChainState': {
      APIsController.syncChainConnections();
      return false;
    }
    default: {
      console.warn(`Unknown API task: ${message.task}`);
      return false;
    }
  }
};
