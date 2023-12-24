// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { AccountStateContextInterface } from './types';

export const defaultAccountState: AccountStateContextInterface = {
  setAccountStateKey: (chain, address, key, value) => {},
  getAccountStateKey: (chain, address, key) => {},
};
