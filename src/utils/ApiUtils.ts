import { APIsController } from '@/controller/APIsController';
import { ChainList } from '@/config/chains';
import type { ChainID } from '@/types/chains';

// Get a chain's API instance or throw an error.
export const getApiInstance = async (chainId: ChainID) => {
  if (!APIsController.chainExists(chainId)) {
    await APIsController.new(ChainList.get(chainId)!.endpoints.rpc);
  }

  const instance = APIsController.get(chainId);

  if (!instance) {
    throw new Error(
      `SubscriptionsController: ${chainId} API instance couldn't be created`
    );
  }

  return instance;
};
