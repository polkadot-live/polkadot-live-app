// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import type { TxMetaContextInterface } from './types';

export const defaultTxMeta: TxMetaContextInterface = {
  txFees: new BigNumber(0),
  notEnoughFunds: false,
  // eslint-disable-next-line
  setTxFees: (f) => {},
  // eslint-disable-next-line
  resetTxFees: () => {},
  sender: null,
  // eslint-disable-next-line
  setSender: (s) => {},
  txFeesValid: false,
  // eslint-disable-next-line
  getTxPayload: () => {},
  getGenesisHash: () => null,
  // eslint-disable-next-line
  setGenesisHash: (v) => {},
  // eslint-disable-next-line
  setTxPayload: (p, u) => {},
  getTxSignature: () => null,
  // eslint-disable-next-line
  resetTxPayloads: () => {},
  // eslint-disable-next-line
  setTxSignature: (s) => {},
};
