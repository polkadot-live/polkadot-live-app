// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BusDispatcher } from '@polkadot-live/core';
import { DbController } from '../controllers';
import { eventBus } from './eventBus';
import { handleMessage } from './messages';

const bootstrap = async () => {
  BusDispatcher.init(eventBus);
  await DbController.initialize();
};

bootstrap().then(() => {
  console.log('> Bootstrap complete...');
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  const handled = handleMessage(message, sendResponse);
  return handled;
});
