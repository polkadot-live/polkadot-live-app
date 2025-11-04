// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RenameHandlerAdaptor } from './types';

export const chromeAdapter: RenameHandlerAdaptor = {
  handleRename: async (updatedAccount, originalAccount) => {
    await chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'update',
      payload: { account: updatedAccount },
    });

    // Update encoded account names in main renderer.
    const { encodedAccounts: updatedEncoded } = updatedAccount;
    for (const encodedAccount of Object.values(updatedEncoded)) {
      const { chainId, alias } = encodedAccount;
      if (alias !== originalAccount.encodedAccounts[chainId].alias) {
        await chrome.runtime.sendMessage({
          type: 'rawAccount',
          task: 'renameAccount',
          payload: { account: encodedAccount },
        });
      }
    }
  },
};
