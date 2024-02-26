// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '@/controller/APIsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import { AccountsController } from '@/controller/AccountsController';
import { ChainList } from '@/config/chains';
import { MainDebug } from './DebugUtils';
import type { ChainID } from '@/types/chains';
import type { SubscriptionTask } from '@/types/subscriptions';

const debug = MainDebug.extend('ApiUtils');

/**
 * @name getApiInstance
 * @summary Connects an API instance to an endpoint and returns it.
 */
export const getApiInstance = async (chainId: ChainID) => {
  const instance = await APIsController.fetchConnectedInstance(chainId);

  if (!instance) {
    throw new Error(
      `ensureApiConnected: ${chainId} API instance couldn't be fetched.`
    );
  }

  debug('🔷 Fetched API instance for chain: %o', chainId);
  return instance;
};

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

/**
 * @name addApiInstance
 * @summary Add a new `API` instance to `APIsController`.
 * @deprecated This function should no longer be used.
 */
// TODO: Remove this function if it's no longer needed after
// multi-chain support is added.
export const addApiInstance = async (chainId: ChainID) => {
  if (!APIsController.chainExists(chainId)) {
    const chainData = ChainList.get(chainId);

    if (chainData) {
      await APIsController.new(chainId);
    }
  }
};
