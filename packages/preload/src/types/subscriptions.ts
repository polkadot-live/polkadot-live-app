// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from './chains/index.js';
import type { AnyFunction, AnyData } from './misc.js';
import type { FlattenedAccountData } from './accounts.js';

export type HelpItemKey =
  | 'help:import:vault'
  | 'help:import:ledger'
  | 'help:import:readOnly'
  | 'help:subscription:balances:transfers'
  | 'help:subscription:balances:frozen'
  | 'help:subscription:balances:reserved'
  | 'help:subscription:balances:spendable'
  | 'help:subscription:nominationPools:commission'
  | 'help:subscription:nominationPools:name'
  | 'help:subscription:nominationPools:state'
  | 'help:subscription:nominationPools:roles'
  | 'help:subscription:nominationPools:rewards'
  | 'help:subscription:nominating:commission'
  | 'help:subscription:nominating:exposure'
  | 'help:subscription:nominating:payouts'
  | 'help:subscription:nominating:nominations'
  | 'help:subscription:chain:timestamp'
  | 'help:subscription:chain:currentSlot'
  | 'help:settings:dockedWindow'
  | 'help:settings:showOnAllWorkspaces'
  | 'help:settings:silenceOsNotifications'
  | 'help:settings:importData'
  | 'help:settings:exportData'
  | 'help:settings:showDebuggingSubscriptions'
  | 'help:settings:enableAutomaticSubscriptions'
  | 'help:settings:enablePolkassembly'
  | 'help:settings:hideDockIcon'
  | 'help:settings:keepOutdatedEvents'
  | 'help:openGov:track'
  | 'help:openGov:origin'
  | 'help:openGov:maxDeciding'
  | 'help:openGov:preparePeriod'
  | 'help:openGov:decisionPeriod'
  | 'help:openGov:confirmPeriod'
  | 'help:openGov:enactmentPeriod'
  | 'help:openGov:origin:root'
  | 'help:openGov:origin:whitelistedCaller'
  | 'help:openGov:origin:wishForChange'
  | 'help:openGov:origin:stakingAdmin'
  | 'help:openGov:origin:treasurer'
  | 'help:openGov:origin:leaseAdmin'
  | 'help:openGov:origin:fellowshipAdmin'
  | 'help:openGov:origin:generalAdmin'
  | 'help:openGov:origin:auctionAdmin'
  | 'help:openGov:origin:referendumCanceller'
  | 'help:openGov:origin:referendumKiller'
  | 'help:openGov:origin:smallTipper'
  | 'help:openGov:origin:bigTipper'
  | 'help:openGov:origin:smallSpender'
  | 'help:openGov:origin:mediumSpender'
  | 'help:openGov:origin:bigSpender'
  | 'help:openGov:treasuryBalance'
  | 'help:openGov:nextBurn'
  | 'help:openGov:toBeAwarded'
  | 'help:openGov:spendPeriod'
  | 'help:interval:openGov:referendumVotes'
  | 'help:interval:openGov:decisionPeriod'
  | 'help:interval:openGov:referendumThresholds'
  | 'help:docs:disclaimer'
  | 'help:docs:privacy'
  | 'help:summary:activeAccounts'
  | 'help:summary:events'
  | 'help:summary:subscriptions';

/// Where `default` reads the tasks `enableOsNotifications` field.
export type NotificationPolicy = 'default' | 'none' | 'one-shot';

export interface IntervalSetting {
  label: string;
  ticksToWait: number;
}

export interface IntervalSubscription {
  // Unique id for the task.
  action: string;
  // Number of ticks between each one-shot execution.
  intervalSetting: IntervalSetting;
  // Used as a countdown.
  tickCounter: number;
  // Task category.
  category: string;
  // Task's associated chain.
  chainId: ChainID;
  // Shown in renderer.
  label: string;
  // Enabled or disabled.
  status: 'enable' | 'disable';
  // Flag to enable or silence OS notifications.
  enableOsNotifications: boolean;
  // Key to retrieve help information about the task.
  helpKey: HelpItemKey;
  // Associated referendum id for task.
  referendumId?: number;
  // Flag to determine if the subscription was just build (may not be needed)
  justBuilt?: boolean;
}

export type SubscriptionNextStatus = 'enable' | 'disable';

export interface SubscriptionTask {
  // Unique id for the task.
  action: TaskAction;
  // Arguments for the queryMulti call.
  actionArgs?: string[];
  // Api call representation.
  apiCallAsString: string;
  // Task category.
  category: TaskCategory;
  // Task's associated chain.
  chainId: ChainID;
  // Shown in renderer.
  label: string;
  // Enabled or disabled.
  status: SubscriptionNextStatus;
  // Associated account for task.
  account?: FlattenedAccountData;
  // Index to retrieve api callback data.
  dataIndex?: number;
  // Flag to determine if native OS notifications are shown for the task.
  enableOsNotifications: boolean;
  // Flag to determine if the subscription was just built.
  justBuilt?: boolean;
  // Key into help array to retrieve information about the task.
  helpKey: HelpItemKey;
}

// String literals to limit subscription task actions.
export type TaskAction =
  | 'subscribe:chain:timestamp'
  | 'subscribe:chain:currentSlot'
  | 'subscribe:account:balance:free'
  | 'subscribe:account:balance:frozen'
  | 'subscribe:account:balance:reserved'
  | 'subscribe:account:balance:spendable'
  | 'subscribe:account:nominationPools:rewards'
  | 'subscribe:account:nominationPools:state'
  | 'subscribe:account:nominationPools:renamed'
  | 'subscribe:account:nominationPools:roles'
  | 'subscribe:account:nominationPools:commission'
  | 'subscribe:account:nominating:pendingPayouts'
  | 'subscribe:account:nominating:exposure'
  | 'subscribe:account:nominating:commission'
  | 'subscribe:account:nominating:nominations';

/// String literals to define task categories.
export type TaskCategory =
  | 'Balances'
  | 'Nomination Pools'
  | 'Nominating'
  | 'Chain';

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

export type SubscriptionTaskType = 'account' | 'chain' | 'interval' | '';

// Wraps an array of subscription tasks along with their
// associated type (chain or account) and possible account
// address.
export interface WrappedSubscriptionTasks {
  type: SubscriptionTaskType;
  tasks: SubscriptionTask[];
}
