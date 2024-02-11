import type { ChainID } from './chains';
import type { AnyFunction } from '@polkadot-cloud/react/types';
import type { AnyData } from './misc';
import type { FlattenedAccountData } from './accounts';

export type SubscriptionNextStatus = 'enable' | 'disable';

export interface SubscriptionTask {
  action: string;
  actionArgs?: string[];
  chainId: ChainID;
  status: SubscriptionNextStatus;
  label: string;
  account?: FlattenedAccountData;
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

export type SubscriptionTaskType = 'chain' | 'account' | '';

// Wraps an array of subscription tasks along with their
// associated type (chain or account) and possible account
// address.
export interface WrappedSubscriptionTasks {
  type: SubscriptionTaskType;
  address?: string;
  tasks: SubscriptionTask[];
}
