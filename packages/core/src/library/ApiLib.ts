// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsController,
  APIsController,
  SubscriptionsController,
} from '../controllers';
import { ChainList } from '@polkadot-live/consts/chains';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

/**
 * @name tryApiDisconnect
 * @summary Disconnects from an API instance if its no longer required.
 */
export const tryApiDisconnect = async (task: SubscriptionTask) => {
  const { chainId, status } = task;

  // Check if there are any chain or account tasks that require an API instance.
  if (status === 'disable' && !isApiRequired(chainId)) {
    console.log('🔷 Disconnect API instance for chain: %o', chainId);

    await APIsController.close(chainId);
  }
};

/**
 * @name disconnectAPIs
 * @summary Disconnect from any API instances that are not currently required.
 */
export const disconnectAPIs = async () => {
  const isConnected: boolean =
    (await window.myAPI.sendConnectionTaskAsync({
      action: 'connection:getStatus',
      data: null,
    })) || false;

  if (isConnected) {
    await Promise.all(
      Array.from(ChainList.keys())
        .filter((c) => !isApiRequired(c))
        .map((c) => APIsController.close(c))
    );
  }
};

/**
 * @name isApiRequired
 * @summary Returns `true` if an API instance is still needed for any chain or account subscriptions.
 * @returns {boolean}
 */
const isApiRequired = (chainId: ChainID) => {
  // Return `true` if any chain subscriptions require an API instance of the chain ID.
  if (SubscriptionsController.requiresChainApi(chainId)) {
    return true;
  }

  // Return `true` if any account requires an API instance of the chain ID.
  for (const account of AccountsController.accounts.get(chainId) || []) {
    if (account.queryMulti?.requiresChainApi(chainId)) {
      return true;
    }
  }

  return false;
};
