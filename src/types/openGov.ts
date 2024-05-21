// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * Type of referenda received from API.
 */
export type ActiveReferenda = [[string], [ActiveReferendaInfo]];

/**
 * Information received from API for active (ongoing) referenda.
 */
export interface ActiveReferendaInfo {
  Ongoing: {
    alarm: [string, [string, string]];
    deciding: {
      confirming: null | string;
      since: string;
    } | null;
    decisionDeposit: {
      amount: string;
      who: string;
    };
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
