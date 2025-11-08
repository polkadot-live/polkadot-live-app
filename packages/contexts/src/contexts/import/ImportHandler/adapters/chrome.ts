// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ImportHandlerAdapter } from './types';

export const chromeAdapter: ImportHandlerAdapter = {
  persist: async (genericAccount) => {
    const payload = { account: genericAccount };
    const msg = { type: 'rawAccount', task: 'persist', payload };
    await chrome.runtime.sendMessage(msg);
  },

  postToMain: (genericAccount, encodedAccount) =>
    chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'importAddress',
      payload: { encodedAccount, genericAccount },
    }),
};
