import type { SubscriptionsContextInterface } from './types';

export const defaultSubscriptionsContext: SubscriptionsContextInterface = {
  chainSubscriptions: new Map(),
  setChainSubscriptions: () => {},
  getChainSubscriptions: () => [],
};
