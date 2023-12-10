import type { SubscriptionsContextInterface } from './types';
import type { WrappedSubscriptionTasks } from '@/types/subscriptions';

export const defaultSubscriptionsContext: SubscriptionsContextInterface = {
  chainSubscriptions: new Map(),
  accountSubscriptions: new Map(),
  renderedSubscriptions: { type: '', tasks: [] },
  getRenderedSubscriptions: () =>
    ({ type: '', tasks: [] }) as WrappedSubscriptionTasks,
  setRenderedSubscriptions: () => {},
  updateRenderedSubscriptions: () => {},
  setChainSubscriptions: () => {},
  getChainSubscriptions: () => [],
  setAccountSubscriptions: () => {},
  getAccountSubscriptions: () => [],
  updateTask: () => {},
};
