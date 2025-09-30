// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../controllers';
import type { Stores } from '../controllers';

const bootstrap = async () => {
  await DbController.initialize();
};

bootstrap().then(() => {
  console.log('> Bootstrap complete...');
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'db') {
    const { store, key }: { store: Stores; key: string } = message;
    DbController.get(store, key).then(sendResponse);
    return true;
  }
});
