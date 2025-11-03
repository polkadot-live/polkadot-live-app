// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@polkadot-live/core';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';

export const handleSubscriptionMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'chainHasSubscriptions': {
      const { chainId }: { chainId: ChainID } = message.payload;
      const accounts = AccountsController.accounts.get(chainId) || [];

      let result = false;
      for (const account of accounts) {
        const tasks = account.getSubscriptionTasks();
        if (tasks && tasks.length > 0) {
          result = true;
          break;
        }
      }
      sendResponse(result);
      return true;
    }
    default: {
      console.warn(`Unknown subscription task: ${message.task}`);
      return false;
    }
  }
};
