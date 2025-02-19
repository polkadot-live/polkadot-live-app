// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from '@polkadot-live/types/misc';
import type {
  ActionMeta,
  AddressInfo,
  ExtrinsicDynamicInfo,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';

export interface TxMetaContextInterface {
  addressesInfo: AddressInfo[];
  extrinsics: Map<string, ExtrinsicInfo>;
  selectedFilter: string;
  showMockUI: boolean;
  getCategoryTitle: (info: ExtrinsicInfo) => string;
  getFilteredExtrinsics: () => ExtrinsicInfo[];
  getGenesisHash: (txUid: string) => AnyJson | null;
  getTxPayload: (txUid: string) => Uint8Array | null;
  handleOpenCloseWcModal: (open: boolean, uri?: string) => Promise<void>;
  importExtrinsics: (serialized: string) => void;
  initTx: (actionMeta: ActionMeta) => void;
  initTxDynamicInfo: (txId: string) => void;
  onFilterChange: (val: string) => void;
  notifyInvalidExtrinsic: (message: string) => void;
  setEstimatedFee: (txId: string, estimatedFee: string) => Promise<void>;
  setTxDynamicInfo: (txId: string, dynamicInfo: ExtrinsicDynamicInfo) => void;
  setTxSignature: (txId: string, s: AnyJson) => void;
  submitTx: (txId: string) => void;
  submitMockTx: (txId: string) => void;
  updateAccountName: (address: string, accountName: string) => Promise<void>;
  updateTxStatus: (txId: string, txStatus: TxStatus) => Promise<void>;
  removeExtrinsic: (info: ExtrinsicInfo) => Promise<void>;
}
