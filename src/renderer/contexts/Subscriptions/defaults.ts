import type { SubscriptionsContextInterface } from './types';

export const defaultSubscriptionsContext: SubscriptionsContextInterface = {
  chainSubscriptions: new Map(),
  accountSubscriptions: new Map(),
  renderedSubscriptions: { type: '', tasks: [] },
  setRenderedSubscriptions: () => {},
  updateRenderedSubscriptions: () => {},
  setChainSubscriptions: () => {},
  getChainSubscriptions: () => [],
  setAccountSubscriptions: () => {},
  getAccountSubscriptions: () => [],
  updateTask: () => {},
};
