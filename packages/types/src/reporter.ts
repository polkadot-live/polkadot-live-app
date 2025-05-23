// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from './accounts';
import type { ActionMeta } from './tx';
import type { AnyData, AnyJson } from './misc';
import type { ChainID } from './chains';
import type { TaskAction } from './subscriptions';

// Batch notification config.
export interface BatchConfig {
  interval: number;
  misc?: boolean;
  leftovers?: boolean;
}

export interface ReportDelegator {
  delegator: string;
  callback: string;
}

// A miscellaneous report that is not tied to a specific chain or block.
export interface MiscReport {
  _type: 'misc';
  time: Date;
  message: string;
}

// Extrinsic details.
export interface ExtrinsicInner {
  type: 'extrinsic';
  signer: string;
  nonce: number;
  data: AnyData[];
}

// Event details.
export interface EventInner {
  type: 'event';
  data: AnyData;
}

export interface TxAction {
  label: string;
  txMeta: ActionMeta;
}

export interface UriAction {
  uri: string;
  label: string;
}

// Callback event interface
export interface EventCallback {
  uid: string;
  category: string;
  taskAction: TaskAction | string; // TODO: IntervalAction
  who: {
    origin: 'account' | 'chain' | 'interval';
    data: EventAccountData | EventChainData;
  };
  title: string;
  subtitle: string;
  data: AnyJson;
  timestamp: number;
  txActions: TxAction[];
  uriActions: UriAction[];
  stale: boolean;
}

// Notification data
export interface NotificationData {
  title: string;
  body: string;
  subtitle?: string;
}

// Data to identify an account with an event.
export interface EventAccountData {
  accountName: string;
  address: string;
  chainId: ChainID;
  source: AccountSource;
}

// Data to identify a chain ID with an event.
export interface EventChainData {
  chainId: ChainID;
}

export interface DismissEvent {
  uid: string;
  who: {
    origin: 'account' | 'chain' | 'interval';
    data: EventAccountData | EventChainData;
  };
}
