// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@/types/chains';
import type { ActiveReferendaInfo } from '@/types/openGov';

export interface ReferendaContextInterface {
  referenda: ActiveReferendaInfo[];
  fetchingReferenda: boolean;
  activeReferendaChainId: ChainID;
  fetchReferendaData: (chainId: ChainID) => void;
  refetchReferenda: () => void;
  receiveReferendaData: (info: ActiveReferendaInfo[]) => void;
  setReferenda: (referenda: ActiveReferendaInfo[]) => void;
  setFetchingReferenda: (flag: boolean) => void;
  getSortedActiveReferenda: (desc: boolean) => ActiveReferendaInfo[];
  getCategorisedReferenda: (
    desc: boolean
  ) => Map<string, ActiveReferendaInfo[]>;
}
