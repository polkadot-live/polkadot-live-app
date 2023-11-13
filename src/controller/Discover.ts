// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { All, AnyJson, MethodSubscription } from '@polkadot-live/types';
import { ChainID } from '@polkadot-live/types/chains';
import { MainDebug } from '@/debugging';
import { Account } from '@/model/Account';
import { APIsController } from './APIsController';
import { AccountsController } from './AccountsController';
import { ChainsController } from './ChainsController';

const debug = MainDebug.extend('Discover');

export class Discover {
  // Discover the initial subscription config for an account.
  static start = async (
    chain: ChainID,
    account: Account
  ): Promise<{ chainState: AnyJson; config: MethodSubscription }> => {
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
  static bootstrapEvents = (chain?: ChainID) => {
    const handleBootstrap = (c: ChainID) => {
      if (c && !APIsController.get(c)?.api.isReady) {
        // Note: this happens when the user opens the menu or app window before the API instance is
        // connected and `isReady`.
        debug(`❗️ Api for ${c} not ready, skipping bootstrap`);
        return;
      }
      debug(`💳 Bootstrapping for accounts, chain ${chain || 'all chains'}`);

      // TODO: new `eventsCache` to stop querying every time?.
      if (c) ChainsController.bootstrap(c);
    };

    if (!chain) {
      for (const c of Object.keys(AccountsController.accounts))
        handleBootstrap(c as ChainID);
    } else handleBootstrap(chain);
  };
}
