// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type {
  PagedReferenda,
  ReferendaInfo,
} from '@polkadot-live/types/openGov';

export interface ReferendaContextInterface {
  activePagedReferenda: PagedReferenda;
  activeReferendaChainId: ChainID;
  fetchingReferenda: boolean;
  historyPagedReferenda: PagedReferenda;
  referendaMap: Map<ChainID, ReferendaInfo[]>;
  tabVal: 'active' | 'history';
  fetchReferendaData: (chainId: ChainID) => void;
  getActiveReferenda: (other?: ReferendaInfo[]) => ReferendaInfo[];
  getItemsPerPage: (directory: 'active' | 'history') => number;
  getPageNumbers: (directory: 'active' | 'history') => number[];
  getReferendaCount: (trackId: string | null) => number;
  getTrackFilter: () => string | null;
  receiveReferendaData: (info: ReferendaInfo[]) => Promise<void>;
  refetchReferenda: () => void;
  setFetchingReferenda: (flag: boolean) => void;
  setPage: (page: number, directory: 'active' | 'history') => void;
  setReferendaMap: React.Dispatch<
    React.SetStateAction<Map<ChainID, ReferendaInfo[]>>
  >;
  setRefTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  setTabVal: React.Dispatch<React.SetStateAction<'active' | 'history'>>;
  showPageEllipsis: (directory: 'active' | 'history') => boolean;
  updateHasFetchedReferenda: (chainId: ChainID) => void;
  updateTrackFilter: (val: string | null) => void;
}
