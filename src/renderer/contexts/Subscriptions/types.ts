import type { ChainID } from '@/types/chains';
import type { SubscriptionTask } from '@/types/subscriptions';

export interface SubscriptionsContextInterface {
  chainSubscriptions: Map<ChainID, SubscriptionTask[]>;
  setChainSubscriptions: (a: Map<ChainID, SubscriptionTask[]>) => void;
  getChainSubscriptions: (a: ChainID) => SubscriptionTask[];
}
