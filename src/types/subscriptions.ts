import type { ChainID } from './chains';
import type { AnyFunction } from '@polkadot-cloud/react/types';
import type { AnyData } from './misc';

export type SubscriptionNextStatus = 'enable' | 'disable';

export interface SubscriptionTask {
  action: string;
  actionArgs?: string[];
  chainId: ChainID;
  status: SubscriptionNextStatus;
  label: string;
}

// TODO: Refactor (action + actionArgs also in task)
export interface ApiCallEntry {
  action: string;
  actionArgs?: string[];
  apiCall: AnyFunction;
  curVal: AnyData | null;
  task: SubscriptionTask; // Cache the associated task
}

// TODO: May need to store api isntance reference.
export interface QueryMultiEntry {
  callEntries: ApiCallEntry[];
  unsub: AnyFunction | null;
}

// Used in React app.
export interface CachedSubscriptions {
  type: 'chain' | 'account' | '';
  address?: string;
  tasks: SubscriptionTask[];
}
