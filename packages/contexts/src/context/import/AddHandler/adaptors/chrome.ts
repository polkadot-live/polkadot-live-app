// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AddHandlerAdaptor } from './types';

export const chromeAdapter: AddHandlerAdaptor = {
  postToMain: (encodedAccount, genericAccount) => {
    chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'importAddress',
      payload: { encodedAccount, genericAccount },
    });
  },

  updateAddressInStore: async (account) => {
    const msg = { type: 'rawAccount', task: 'update', payload: { account } };
    await chrome.runtime.sendMessage(msg);
  },
};
