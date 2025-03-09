// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type RefInQueue = RefOngoing; // inQueue: true
export type RefPreparing = RefOngoing; // deciding: null
export type RefConfirming = RefOngoing; // deciding.confirming = <string>
export type RefDeciding = RefOngoing; // deciding.confirming = null;

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
  who: string;
  amount: string;
}

export interface RefTimedOut {
  block: string;
  who: string;
  amount: string;
}

export interface RefKilled {
  block: string;
}

export interface RefOngoing {
  alarm: [string, [string, string]];
  deciding: {
    confirming: null | string;
    since: string;
  } | null;
  decisionDeposit: {
    amount: string;
    who: string;
  } | null;
  enactment:
    | {
        After: string;
      }
    | { At: string };
  inQueue: boolean;
  origin: { Origins: string } | { system: string };
  proposal:
    | {
        Lookup: {
          hash: string;
          len: string;
        };
      }
    | { Inline: string };
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

export interface LinearDecreasing {
  length: string;
  floor: string;
  ceil: string;
}

export interface Reciprocal {
  factor: string;
  xOffset: string;
  yOffset: string;
}

export type MinApproval =
  | { Reciprocal: Reciprocal }
  | { LinearDecreasing: LinearDecreasing };

export type MinSupport =
  | { Reciprocal: Reciprocal }
  | { LinearDecreasing: LinearDecreasing };

export interface OneShotReturn {
  success: boolean;
  message?: string;
}
