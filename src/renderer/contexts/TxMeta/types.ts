// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AnyJson } from '@polkadot-live/types';
import type BigNumber from 'bignumber.js';

export interface TxMetaContextInterface {
  txFees: BigNumber;
  notEnoughFunds: boolean;
  setTxFees: (f: BigNumber) => void;
  resetTxFees: () => void;
  sender: string | null;
  setSender: (s: string | null) => void;
  txFeesValid: boolean;
  getTxPayload: () => AnyJson;
  setTxPayload: (u: number, s: AnyJson) => void;
  getGenesisHash: () => AnyJson;
  setGenesisHash: (h: AnyJson) => void;
  resetTxPayloads: () => void;
  getTxSignature: () => AnyJson;
  setTxSignature: (s: AnyJson) => void;
}
