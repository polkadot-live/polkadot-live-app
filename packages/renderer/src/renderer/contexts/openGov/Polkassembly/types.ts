// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ActiveReferendaInfo } from '@polkadot-live/types/openGov';

export interface PolkassemblyProposal {
  title: string;
  postId: number;
  content: string;
  status: string;
}

export interface PolkassemblyContextInterface {
  usePolkassemblyApi: boolean;
  getProposal: (
    chainId: ChainID,
    referendumId: number
  ) => PolkassemblyProposal | null;
  fetchProposals: (
    chainId: ChainID,
    referenda: ActiveReferendaInfo[]
  ) => Promise<void>;
  setUsePolkassemblyApi: React.Dispatch<React.SetStateAction<boolean>>;
}
