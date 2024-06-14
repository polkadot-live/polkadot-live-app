// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@/types/chains';
import type { ActiveReferendaInfo } from '@/types/openGov';

export interface PolkassemblyProposal {
  title: string;
  postId: number;
  content: string;
  status: string;
}

export interface PolkassemblyContextInterface {
  proposals: PolkassemblyProposal[];
  fetchingProposals: boolean;
  getProposal: (referendumId: number) => PolkassemblyProposal | null;
  fetchProposals: (
    chainId: ChainID,
    referenda: ActiveReferendaInfo[]
  ) => Promise<void>;
}
