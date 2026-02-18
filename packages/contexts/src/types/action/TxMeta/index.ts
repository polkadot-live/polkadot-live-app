// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { AnyJson } from '@polkadot-live/types/misc';
import type {
  ActionMeta,
  AddressInfo,
  ExtFilterOption,
  ExtrinsicDynamicInfo,
  ExtrinsicInfo,
  PagedExtrinsicItems,
  TxStatus,
} from '@polkadot-live/types/tx';

export interface TxMetaContextInterface {
  addressesInfo: AddressInfo[];
  extrinsics: Map<string, ExtrinsicInfo>;
  pagedExtrinsics: PagedExtrinsicItems;
  selectedFilter: string;
  showMockUI: boolean;
  getCategoryTitle: (info: ExtrinsicInfo) => string;
  getExtrinsicsPage: (page: number) => ExtrinsicInfo[];
  getFilteredExtrinsics: () => ExtrinsicInfo[];
  getGenesisHash: (txUid: string) => AnyJson | null;
  getPageCount: () => number;
  getPageNumbers: () => number[];
  getSortedFilterOptions: (section: 'top' | 'bottom') => ExtFilterOption[];
  getTxPayload: (txUid: string) => Uint8Array | null;
  handleOpenCloseWcModal: (open: boolean, uri?: string) => Promise<void>;
  importExtrinsics: (serialized: string) => void;
  initTx: (actionMeta: ActionMeta) => void;
  initTxDynamicInfo: (txId: string) => void;
  onFilterChange: (val: string) => void;
  notifyInvalidExtrinsic: (message: string) => void;
  removeExtrinsic: (info: ExtrinsicInfo) => Promise<void>;
  setEstimatedFee: (txId: string, estimatedFee: string) => Promise<void>;
  setFilterOption: (filter: TxStatus, selected: boolean) => void;
  setPage: (page: number) => void;
  setTxDynamicInfo: (txId: string, dynamicInfo: ExtrinsicDynamicInfo) => void;
  setTxHash: (txId: string, txHash: `0x${string}`) => void;
  setTxSignature: (txId: string, s: AnyJson) => void;
  submitTx: (txId: string) => void;
  submitMockTx: (txId: string) => void;
  updateAccountName: (
    address: string,
    chainId: ChainID,
    accountName: string,
  ) => Promise<void>;
  updateTxStatus: (txId: string, txStatus: TxStatus) => Promise<void>;
}
