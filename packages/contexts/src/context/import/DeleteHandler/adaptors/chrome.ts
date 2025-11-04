// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DeleteHandlerAdaptor } from './types';

export const chromeAdapter: DeleteHandlerAdaptor = {
  removeFromStore: async (source, publicKeyHex) => {
    const payload = { publicKeyHex, source };
    const msg = { type: 'rawAccount', task: 'delete', payload };
    await chrome.runtime.sendMessage(msg);
  },

  postToMain: (address, chainId) =>
    chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'removeAddress',
      payload: { address, chainId },
    }),
};
