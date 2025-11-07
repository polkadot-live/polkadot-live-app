// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigImport } from '@polkadot-live/core';
import type { RenameHandlerAdapter } from './types';

export const electronAdapter: RenameHandlerAdapter = {
  handleRename: async (updatedAccount, originalAccount) => {
    await window.myAPI.rawAccountTask({
      action: 'raw-account:update',
      data: { serialized: JSON.stringify(updatedAccount) },
    });

    // Update encoded account names in main renderer.
    const { encodedAccounts: updatedEncoded } = updatedAccount;
    for (const encodedAccount of Object.values(updatedEncoded)) {
      const { chainId, alias } = encodedAccount;

      if (alias !== originalAccount.encodedAccounts[chainId].alias) {
        const { address, alias: newName } = encodedAccount;
        ConfigImport.portImport.postMessage({
          task: 'renderer:account:rename',
          data: { address, chainId, newName },
        });
      }
    }
  },
};
