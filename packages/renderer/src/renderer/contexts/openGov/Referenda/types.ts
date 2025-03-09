// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';

export interface ReferendaContextInterface {
  activeReferendaChainId: ChainID;
  fetchingReferenda: boolean;
  referendaMap: Map<ChainID, ReferendaInfo[]>;
  fetchReferendaData: (chainId: ChainID) => void;
  refetchReferenda: () => void;
  receiveReferendaData: (info: ReferendaInfo[]) => Promise<void>;
  setReferendaMap: React.Dispatch<
    React.SetStateAction<Map<ChainID, ReferendaInfo[]>>
  >;
  setFetchingReferenda: (flag: boolean) => void;
  getSortedActiveReferenda: (
    desc: boolean,
    otherReferenda?: ReferendaInfo[]
  ) => ReferendaInfo[];
  getReferendaCount: (trackId: string | null) => number;
  getTrackFilter: () => string | null;
  updateHasFetchedReferenda: (chainId: ChainID) => void;
  updateTrackFilter: (val: string | null) => void;

  // new
  activePage: number;
  activePageCount: number;
  activePagedReferenda: ReferendaInfo[];
  showPageEllipsis: () => boolean;
  getCurPages: () => number[];
  setActivePage: React.Dispatch<React.SetStateAction<number>>;
  setRefTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}
