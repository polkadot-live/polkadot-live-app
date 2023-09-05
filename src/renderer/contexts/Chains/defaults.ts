// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainsContextInterface } from './types';

export const defaultChainsContext: ChainsContextInterface = {
  chains: [],
  //eslint-disable-next-line
  addChain: (c, s) => {},
  // eslint-disable-next-line
  removeChain: (c) => {},
  //eslint-disable-next-line
  getChain: (c) => {},
  //eslint-disable-next-line
  setChain: (c) => {},
};
