import { APIsController } from '@/controller/APIsController';
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
