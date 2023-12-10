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

// Stores an actual Polkadot JS API function, it's current
// cached value, and associated subscription task.
export interface ApiCallEntry {
  apiCall: AnyFunction;
  curVal: AnyData | null;
  task: SubscriptionTask;
}

// TODO: May need to store api instance reference.
export interface QueryMultiEntry {
  callEntries: ApiCallEntry[];
  unsub: AnyFunction | null;
}

// Wraps an array of subscription tasks along with their
// associated type (chain or account) and possible account
// address.
export interface WrappedSubscriptionTasks {
  type: 'chain' | 'account' | '';
  address?: string;
  tasks: SubscriptionTask[];
}

// Wraps a single subscription task along with its associated
// type (chain or account) and possible account address.
export interface WrappedSubscriptionTask {
  type: 'chain' | 'account' | '';
  address?: string;
  task: SubscriptionTask;
}
