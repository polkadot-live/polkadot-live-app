// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '@ren/controller/APIsController';
import { SubscriptionsController } from '@ren/controller/SubscriptionsController';
import { AccountsController } from '@ren/controller/AccountsController';
import { MainDebug } from './DebugUtils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

const debug = MainDebug.extend('ApiUtils');

/**
 * @name checkAndHandleApiDisconnect
 * @summary Disconnects from an API instance if its no longer required.
 */
export const checkAndHandleApiDisconnect = async (task: SubscriptionTask) => {
  const { chainId, status } = task;

  // Check if there are any chain or account tasks that require an API instance.
  if (status === 'disable' && !isApiInstanceRequiredFor(chainId)) {
    debug('🔷 Disconnect API instance for chain: %o', chainId);

    await APIsController.close(chainId);
  }
};

/**
 * @name handleApiDisconnects
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
      (['Polkadot', 'Kusama', 'Westend'] as ChainID[])
        .filter((c) => !isApiInstanceRequiredFor(c))
        .map((c) => APIsController.close(c))
    );
  }
};

/**
 * @name isApiInstanceRequiredFor
 * @summary Returns `true` if an API instance is still needed for any chain or account subscriptions.
 * @returns {boolean}
 */
const isApiInstanceRequiredFor = (chainId: ChainID) => {
  // Return `true` if any chain subscriptions require an API instance of the chain ID.
  if (SubscriptionsController.requiresApiInstanceForChain(chainId)) {
    return true;
  }

  // Return `true` if any account requires an API instance of the chain ID.
  for (const account of AccountsController.accounts.get(chainId) || []) {
    if (account.queryMulti?.requiresApiInstanceForChain(chainId)) {
      return true;
    }
  }

  return false;
};
