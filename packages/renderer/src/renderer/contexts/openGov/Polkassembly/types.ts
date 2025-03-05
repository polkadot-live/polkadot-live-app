// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type {
  ActiveReferendaInfo,
  PolkassemblyProposal,
} from '@polkadot-live/types/openGov';

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
