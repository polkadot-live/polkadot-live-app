/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { SubscriptionsContextInterface } from './types';

export const defaultSubscriptionsContext: SubscriptionsContextInterface = {
  chainSubscriptions: new Map(),
  accountSubscriptions: new Map(),
  setChainSubscriptions: () => {},
  getChainSubscriptions: () => [],
  setAccountSubscriptions: () => {},
  getAccountSubscriptions: () => [],
  updateTask: () => {},
};
