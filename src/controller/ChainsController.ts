// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainID } from '@polkadot-live/types/chains';
import { PolkadotCallbacks } from '@/chains/Polkadot/Callbacks';
import { PolkadotState } from '@/chains/Polkadot/State';

export class ChainsController {
  static new(chain: ChainID, address: string) {
    switch (chain) {
      default:
        return new PolkadotState(address);
    }
  }

  static async getChainState(chain: ChainID, address: string) {
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
