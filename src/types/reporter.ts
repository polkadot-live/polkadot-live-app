// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from './accounts';
import type { ActionMeta } from './tx';
import type { AnyData, AnyJson } from './misc';
import type { ChainID } from './chains';
import type { ExtendedAccount } from './blockstream';

// Batch notification config.
export interface BatchConfig {
  interval: number;
  misc?: boolean;
  leftovers?: boolean;
}

// The top-level reporter type that is used for all reporters.
export interface Reporter {
  report(report: Report): Promise<void>;
  groupReport?(reports: Report[]): Promise<void>;
  clean?(): void;
}

// A report is either a notification report or a miscellaneous report.
export type Report = NotificationReport | MiscReport;

// A report represents a notification that is sent to the user.
export interface NotificationReport {
  _type: 'notification';
  hash: string;
  number: number;
  chain: ChainID;
  timestamp: number;
  details: ReportDetail[];
  delegators: ReportDelegator[];
}

export interface ReportDelegator {
  delegator: string;
  callback: string;
}

// Details of a `NotificationReport`, which contains more granular information about the extrinsic
// or event.
export interface ReportDetail {
  pallet: string;
  method: string;
  account: ExtendedAccount;
  inner: EventInner | ExtrinsicInner;
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

export interface EventAction {
  uri: string;
  text?: string;
  txMeta?: ActionMeta;
}

// Callback event interface
export interface EventCallback {
  uid: string;
  category: string;
  who: {
    origin: 'account' | 'chain';
    data: EventAccountData | EventChainData;
  };
  title: string;
  subtitle: string;
  data: AnyJson;
  timestamp: number;
  actions: EventAction[];
  stale: boolean;
}

// Notification data
export interface NotificationData {
  title: string;
  body: string;
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
    origin: 'account' | 'chain';
    data: EventAccountData | EventChainData;
  };
}
