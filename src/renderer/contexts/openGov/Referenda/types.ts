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
  receiveReferendaData: (info: ActiveReferendaInfo[]) => Promise<void>;
  setReferenda: (referenda: ActiveReferendaInfo[]) => void;
  setFetchingReferenda: (flag: boolean) => void;
  getSortedActiveReferenda: (
    desc: boolean,
    otherReferenda?: ActiveReferendaInfo[]
  ) => ActiveReferendaInfo[];
  getCategorisedReferenda: (
    desc: boolean,
    otherReferenda?: ActiveReferendaInfo[]
  ) => Map<string, ActiveReferendaInfo[]>;
}
