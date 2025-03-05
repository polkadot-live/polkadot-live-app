// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * Information received from API for active (ongoing) referenda.
 */
export interface ActiveReferendaInfo {
  referendaId: number;
  Ongoing: {
    alarm: [string, [string, string]];
    deciding: {
      confirming: null | string;
      since: string;
    } | null;
    decisionDeposit: {
      amount: string;
      who: string;
    } | null;
    enactment: {
      After: string;
    };
    inQueue: boolean;
    origin: { Origins: string } | { system: string };
    proposal: {
      Lookup: {
        hash: string;
        len: string;
      };
    };
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
  };
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
