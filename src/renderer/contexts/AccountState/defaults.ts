// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountStateContextInterface } from './types';

export const defaultAccountState: AccountStateContextInterface = {
  //eslint-disable-next-line
  setAccountStateKey: (chain, address, key, value) => {},
  //eslint-disable-next-line
  getAccountStateKey: (chain, address, key) => {},
};
