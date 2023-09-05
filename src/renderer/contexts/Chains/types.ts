// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainStatus } from '@polkadot-live/types/chains';

export interface ChainInstance {
  name: string;
  status: ChainStatus;
}

export interface ChainsContextInterface {
  chains: ChainInstance[];
  addChain: (c: string, s: ChainStatus) => void;
  removeChain: (c: string) => void;
  getChain: (c: string) => void;
  setChain: (c: ChainInstance) => void;
}
