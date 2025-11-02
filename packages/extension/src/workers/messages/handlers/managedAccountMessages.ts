// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@polkadot-live/core';
import type { AnyData } from '@polkadot-live/types/misc';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';

export const handleManagedAccountMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'getAll': {
      sendResponse(
        JSON.stringify(
          Array.from(AccountsController.getAllFlattenedAccountData().entries())
        )
      );
      return true;
    }
    // TODO: Refactor
    case 'subscriptionCount': {
      const { flattened }: { flattened: FlattenedAccountData } = message;
      const { address, chain } = flattened;
      const account = AccountsController.get(chain, address);
      sendResponse(account ? account.getSubscriptionTasks()?.length || 0 : 0);
      return true;
    }
    default: {
      console.warn(`Unknown managed account task: ${message.task}`);
      return false;
    }
  }
};
