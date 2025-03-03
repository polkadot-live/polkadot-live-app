// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ActiveReferendaInfo } from '@polkadot-live/types/openGov';

export interface ReferendaContextInterface {
  activeReferendaChainId: ChainID;
  fetchingReferenda: boolean;
  hasFetched: boolean;
  referenda: ActiveReferendaInfo[];
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
  updateHasFetchedReferenda: (chainId: ChainID) => void;
}
