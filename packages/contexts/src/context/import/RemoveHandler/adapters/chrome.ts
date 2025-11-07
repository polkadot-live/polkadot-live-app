// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RemoveHandlerAdapter } from './types';

export const chromeAdapter: RemoveHandlerAdapter = {
  updateAddressInStore: async (account) => {
    const msg = { type: 'rawAccount', task: 'update', payload: { account } };
    await chrome.runtime.sendMessage(msg);
  },

  postToMain: (address, chainId) =>
    chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'removeAddress',
      payload: { address, chainId },
    }),
};
