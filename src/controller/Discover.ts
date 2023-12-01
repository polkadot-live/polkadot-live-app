// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@/types/chains';
import { MainDebug } from '@/utils/DebugUtils';
import type { Account } from '@/model/Account';
import { APIsController } from './APIsController';
import { ChainsController } from './ChainsController';
import type { All, MethodSubscription } from '@/types/blockstream';
import type { PolkadotAccountState } from '@/types/chains/polkadot';

const debug = MainDebug.extend('Discover');

export class Discover {
  // Discover the initial subscription config for an account.
  static start = async (
    chain: ChainID,
    account: Account
  ): Promise<{
    chainState: PolkadotAccountState;
    config: MethodSubscription;
  }> => {
    const { address } = account;

    // Discover on-chain state for account.
    const chainState = await ChainsController.getChainState(chain, address);

    // Calculate config from account's chain state.
    //
    // TODO: fetch from store. No store item should mean that all events are subscribed to.
    const config = {
      type: 'all',
    } as All;

    return { chainState, config };
  };

  /**
   * @name bootstrapEvents
   * @summary Bootstrap events for all accounts on a chain to prepare the app UI.
   * @param {string=} chain - restrict bootstrapping to a chain.
   */
  static bootstrapEvents = (chainIds: ChainID[]) => {
    const handleBootstrap = (chainId: ChainID) => {
      if (!APIsController.get(chainId)?.api.isReady) {
        // Note: this happens when the user opens the menu or app window before the API instance is
        // connected and `isReady`.
        debug(`❗️ Api for ${chainId} not ready, skipping bootstrap`);
        return;
      }
      debug(`💳 Bootstrapping for accounts, chain ${chainId || 'all chains'}`);

      // TODO: new `eventsCache` to stop querying every time?.
      if (chainId) ChainsController.bootstrap(chainId);
    };

    // Iterate accounts and chain IDs
    for (const chainId of chainIds) {
      handleBootstrap(chainId);
    }
  };

  // Bootstrap events for a particular account.
  // Called when account is imported via the frontend, so API will be available.
  static bootstrapEventsForAccount(chainId: ChainID, account: Account) {
    ChainsController.bootstrap(chainId, account);
  }
}
