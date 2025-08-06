// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PalletReferendaReferendumStatus as PolkadotRefStatus } from '@dedot/chaintypes/polkadot';
import type { PalletReferendaReferendumStatus as KusamaRefStatus } from '@dedot/chaintypes/kusama';
import type { PalletReferendaReferendumStatus as WestendRefStatus } from '@dedot/chaintypes/westend';
import type { PalletReferendaReferendumStatus } from '@dedot/chaintypes/westend-asset-hub';

export type RefInQueue = RefOngoing; // inQueue: true
export type RefPreparing = RefOngoing; // deciding: null
export type RefConfirming = RefOngoing; // deciding.confirming = <string>
export type RefDeciding = RefOngoing; // deciding.confirming = null;

export type ReferendumStatus =
  | PolkadotRefStatus
  | KusamaRefStatus
  | WestendRefStatus
  | PalletReferendaReferendumStatus;

export interface PagedReferenda {
  page: number;
  pageCount: number;
  referenda: ReferendaInfo[];
}

export interface RefFilterOption {
  filter: RefStatus;
  label: string;
  selected: boolean;
}

export type RefStatus =
  | 'Approved'
  | 'Cancelled'
  | 'Confirming'
  | 'Deciding'
  | 'Queueing'
  | 'Killed'
  | 'Preparing'
  | 'Rejected'
  | 'TimedOut';

export interface ReferendaInfo {
  refId: number;
  refStatus: RefStatus;
  info:
    | RefApproved
    | RefCancelled
    | RefConfirming
    | RefDeciding
    | RefInQueue
    | RefKilled
    | RefPreparing
    | RefRejected
    | RefTimedOut;
}

export interface RefApproved {
  block: string;
  who: string | null;
  amount: string | null;
}

export interface RefCancelled {
  block: string;
  who: string | null;
  amount: string | null;
}

export interface RefRejected {
  block: string;
  who: string | null;
  amount: string | null;
}

export interface RefTimedOut {
  block: string;
  who: string | null;
  amount: string | null;
}

export interface RefKilled {
  block: string;
}

export interface RefOngoing {
  alarm: [string, [string, string]] | null;
  deciding: {
    confirming: null | string;
    since: string;
  } | null;
  decisionDeposit: {
    amount: string;
    who: string;
  } | null;
  enactment: { type: 'At'; value: string } | { type: 'After'; value: string };
  inQueue: boolean;
  origin: string;
  proposal:
    | { type: 'Legacy'; value: { hash: string } }
    | { type: 'Inline'; value: string }
    | { type: 'Lookup'; value: { hash: string; len: string } };
  submissionDeposit: {
    amount: string;
    who: string;
  };
  submitted: string;
  tally: {
    ayes: string;
    nays: string;
    support: string;
  };
  track: string;
}

export interface PolkassemblyProposal {
  title: string;
  postId: number;
  content: string;
  status: string;
}

export interface OneShotReturn {
  success: boolean;
  message?: string;
}

export interface SerializedTrackItem {
  id: string;
  info: {
    name: string;
    maxDeciding: string;
    decisionDeposit: string;
    preparePeriod: string;
    decisionPeriod: string;
    confirmPeriod: string;
    minEnactmentPeriod: string;
    minApproval: SerializedPalletReferendaCurve;
    minSupport: SerializedPalletReferendaCurve;
  };
}

export type SerializedPalletReferendaCurve =
  | {
      type: 'LinearDecreasing';
      value: { length: string; floor: string; ceil: string };
    }
  | {
      type: 'SteppedDecreasing';
      value: { begin: string; end: string; step: string; period: string };
    }
  | {
      type: 'Reciprocal';
      value: { factor: string; xOffset: string; yOffset: string };
    };
