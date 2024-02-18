// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import BigNumber from 'bignumber.js';
import type { TxMetaContextInterface } from './types';

export const defaultTxMeta: TxMetaContextInterface = {
  txFees: new BigNumber(0),
  notEnoughFunds: false,
  setTxFees: (f) => {},
  resetTxFees: () => {},
  sender: null,
  setSender: (s) => {},
  txFeesValid: false,
  getTxPayload: () => {},
  getGenesisHash: () => null,
  setGenesisHash: (v) => {},
  setTxPayload: (p, u) => {},
  getTxSignature: () => null,
  resetTxPayloads: () => {},
  setTxSignature: (s) => {},
};
