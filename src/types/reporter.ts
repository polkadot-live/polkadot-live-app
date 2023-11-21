// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtendedAccount } from './blockstream';
import type { ChainID } from './chains';
import type { AnyData, AnyJson } from './misc';

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
}

// Callback event interface
export interface EventCallback {
  uid: string;
  category: string;
  who: {
    chain: ChainID;
    address: string;
  };
  title: string;
  subtitle: string;
  data: AnyJson;
  timestamp: number;
  actions: EventAction[];
}

export interface DismissEvent {
  uid: string;
  who: {
    chain: ChainID;
    address: string;
  };
}
