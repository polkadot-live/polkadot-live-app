// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  handleFetchReferenda,
  handleFetchTracks,
  handleInitTreasury,
} from '../../governance';
import type { ChainID } from '@polkadot-live/types/chains';
import type { AnyData } from '@polkadot-live/types/misc';

export const handleOpenGovMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void,
): boolean => {
  switch (message.task) {
    case 'fetchTracks': {
      const { chainId }: { chainId: ChainID } = message.payload;
      handleFetchTracks(chainId).then((result) => sendResponse(result));
      return true;
    }
    case 'fetchReferenda': {
      const { chainId }: { chainId: ChainID } = message.payload;
      handleFetchReferenda(chainId).then((result) => sendResponse(result));
      return true;
    }
    case 'initTreasury': {
      const { chainId }: { chainId: ChainID } = message.payload;
      handleInitTreasury(chainId).then((result) => sendResponse(result));
      return true;
    }
    default: {
      console.warn(`Unknown OpenGov task: ${message.task}`);
      return false;
    }
  }
};
