// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { connectApis } from '../../apis';
import {
  handleSwitchToOffline,
  handleSwitchToOnline,
  initSystems,
} from '../../init';
import type { AnyData } from '@polkadot-live/types/misc';

export const handleBootstrapMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void,
): boolean => {
  switch (message.task) {
    case 'initSystems': {
      initSystems().then(() => {
        sendResponse(true);
      });
      return true;
    }
    case 'connectApis': {
      connectApis().then((res) => {
        sendResponse(res);
      });
      return true;
    }
    case 'switchToOffline': {
      handleSwitchToOffline().then(() => sendResponse(true));
      return true;
    }
    case 'switchToOnline': {
      handleSwitchToOnline().then(() => sendResponse(true));
      return true;
    }
    default: {
      console.warn(`Unknown bootstrap task: ${message.task}`);
      return false;
    }
  }
};
