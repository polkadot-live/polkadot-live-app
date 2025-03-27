// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @todo Move to `utils/renderer`
 */

import { APIsController } from '@ren/controller/APIsController';
import { SubscriptionsController } from '@ren/controller/SubscriptionsController';
import { AccountsController } from '@ren/controller/AccountsController';
import { MainDebug } from './DebugUtils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

const debug = MainDebug.extend('ApiUtils');

/**
 * @name getApiInstance
 * @summary Connects an API instance to an endpoint and returns it.
 */
export const getApiInstance = async (chainId: ChainID) => {
  const instance = await APIsController.fetchConnectedInstance(chainId);
  return instance ? instance : null;
};

/**
 * @name getApiInstanceOrThrow
 * @summary Same as `getApiInstance` but throws an error if the endpoint fails to connect.
 */
export const getApiInstanceOrThrow = async (
  chainId: ChainID,
  error: string
) => {
  const instance = await getApiInstance(chainId);
  if (!instance) {
    throw new Error(`${error} - Could not get API instance.`);
  }
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

/**
 * @name arraysAreEqual
 * @summary Returns `true` if the two passed arrays are equal, `false` otherwise.
 * @returns {boolean}
 */
export const arraysAreEqual = <T>(array1: T[], array2: T[]): boolean => {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
};

/**
 * @name waitMs
 * @summary Waits the given milliseconds and returns the provided boolean result.
 */
export const waitMs = async (ms: number, result: boolean): Promise<boolean> =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(result), ms));
