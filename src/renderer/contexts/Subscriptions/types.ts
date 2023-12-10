import type { ChainID } from '@/types/chains';
import type {
  CachedSubscriptions,
  SubscriptionTask,
} from '@/types/subscriptions';

export interface SubscriptionsContextInterface {
  chainSubscriptions: Map<ChainID, SubscriptionTask[]>;
  accountSubscriptions: Map<string, SubscriptionTask[]>;
  renderedSubscriptions: CachedSubscriptions;
  setRenderedSubscriptions: (a: CachedSubscriptions) => void;
  updateRenderedSubscriptions: (a: SubscriptionTask) => void;
  setChainSubscriptions: (a: Map<ChainID, SubscriptionTask[]>) => void;
  getChainSubscriptions: (a: ChainID) => SubscriptionTask[];
  setAccountSubscriptions: (a: Map<string, SubscriptionTask[]>) => void;
  getAccountSubscriptions: (a: string) => SubscriptionTask[];
  updateTask: (type: string, task: SubscriptionTask, address?: string) => void;
}
