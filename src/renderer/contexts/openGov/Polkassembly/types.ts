// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface PolkassemblyProposal {
  title: string;
  postId: number;
  content: string;
  status: string;
}

export interface PolkassemblyContextInterface {
  proposals: PolkassemblyProposal[];
  fetchingProposals: boolean;
}
