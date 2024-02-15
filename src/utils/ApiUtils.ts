import { APIsController } from '@/controller/APIsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import { AccountsController } from '@/controller/AccountsController';
import { ChainList } from '@/config/chains';
import type { ChainID } from '@/types/chains';

/**
 * @name getApiInstance
 * @summary Connects an API instance to an endpoint and returns.
 */
export const getApiInstance = async (chainId: ChainID) => {
  const instance = await APIsController.fetchConnectedInstance(chainId);

  if (!instance) {
    throw new Error(
      `ensureApiConnected: ${chainId} API instance couldn't be fetched.`
    );
  }

  return instance;
};

/**
 * @name isApiInstanceRequiredFor
 * @summary Returns `true` if an API instance is still needed for any chain or account subscriptions.
 * @returns {boolean}
 */
export const isApiInstanceRequiredFor = (chainId: ChainID) => {
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
