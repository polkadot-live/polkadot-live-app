// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from './chains';
import type { AnyFunction, AnyData } from './misc';
import type { FlattenedAccountData } from './accounts';

export type SubscriptionNextStatus = 'enable' | 'disable';

export interface SubscriptionTask {
  // Unique id for the task.
  action: TaskAction;
  // Arguments for the queryMulti call.
  actionArgs?: string[];
  // Api call representation.
  apiCallAsString: string;
  // Task's associated chain.
  chainId: ChainID;
  // Enabled or disabled.
  status: SubscriptionNextStatus;
  // Shown in renderer.
  label: string;
  // Associated account for task.
  account?: FlattenedAccountData;
  // Index to retrieve api callback data.
  dataIndex?: number;
}

// String literals to limit subscription task actions.
export type TaskAction =
  | 'subscribe:chain:timestamp'
  | 'subscribe:chain:currentSlot'
  | 'subscribe:account:balance'
  | 'subscribe:account:nominationPools:rewards'
  | 'subscribe:account:nominationPools:state'
  | 'subscribe:account:nominationPools:renamed'
  | 'subscribe:account:nominationPools:roles';

// Stores an actual Polkadot JS API function, it's current
// cached value, and associated subscription task.
export interface ApiCallEntry {
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
  tasks: SubscriptionTask[];
}
