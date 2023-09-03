// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainID } from '@polkadot-live/types/chains';
import { PolkadotCallbacks } from '@/chains/Polkadot/Callbacks';
import { PolkadotState } from '@/chains/Polkadot/State';

export class ChainState {
  static new(chain: ChainID, address: string) {
    switch (chain) {
      default:
        return new PolkadotState(address);
    }
  }

  static async get(chain: ChainID, address: string) {
    switch (chain) {
      default:
        return PolkadotCallbacks.getChainState(address);
    }
  }

  static async bootstrap(chain: ChainID) {
    switch (chain) {
      default:
        return PolkadotCallbacks.bootstrap();
    }
  }
}
