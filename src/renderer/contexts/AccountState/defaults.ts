// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountStateContextInterface } from './types';

export const defaultAccountState: AccountStateContextInterface = {
  //eslint-disable-next-line
  setAccountStateKey: (chain, address, key, value) => {},
  //eslint-disable-next-line
  getAccountStateKey: (chain, address, key) => {},
};
