// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ProposalMeta, ReferendaInfo } from '@polkadot-live/types/openGov';

export interface PolkassemblyContextInterface {
  usePolkassemblyApi: boolean;
  clearProposals: (chainId: ChainID) => void;
  getProposal: (chainId: ChainID, referendumId: number) => ProposalMeta | null;
  fetchProposals: (
    chainId: ChainID,
    referenda: ReferendaInfo[],
  ) => Promise<void>;
  setUsePolkassemblyApi: React.Dispatch<React.SetStateAction<boolean>>;
}
