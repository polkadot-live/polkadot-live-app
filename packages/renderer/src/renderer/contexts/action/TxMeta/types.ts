// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from '@polkadot-live/types/misc';
import type {
  ActionMeta,
  ExtrinsicDynamicInfo,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';
import type BigNumber from 'bignumber.js';

export interface TxMetaContextInterface {
  initTx: (actionMeta: ActionMeta) => void;
  initTxDynamicInfo: (txId: string) => void;
  setTxDynamicInfo: (txId: string, dynamicInfo: ExtrinsicDynamicInfo) => void;
  getTxPayload: (txUid: string) => AnyJson;
  getGenesisHash: (txUid: string) => AnyJson | null;
  setTxSignature: (txId: string, s: AnyJson) => void;
  submitTx: (txId: string) => void;
  extrinsics: Map<string, ExtrinsicInfo>;

  //getTxSignature: () => AnyJson;

  txFees: BigNumber;
  notEnoughFunds: boolean;
  setTxFees: (f: BigNumber) => void;
  resetTxFees: () => void;
  sender: string | null;
  setSender: (s: string | null) => void;
  txFeesValid: boolean;
  setTxPayload: (u: number, s: AnyJson) => void;
  resetTxPayloads: () => void;

  actionMeta: ActionMeta | null;
  setActionMeta: (m: ActionMeta | null) => void;
  txId: number;
  setTxId: (n: number) => void;
  txStatus: TxStatus;
  setTxStatus: (s: TxStatus) => void;
}
