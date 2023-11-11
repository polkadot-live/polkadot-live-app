// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { All, AnyJson, MethodSubscription } from '@polkadot-live/types';
import { ChainID, SomeChainState } from '@polkadot-live/types/chains';
import { MainDebug } from '@/debugging';
import { Account } from '@/model/Account';
import { APIs } from './APIs';
import { Accounts } from './Accounts';
import { ChainState } from './ChainState';

const debug = MainDebug.extend('Discover');

export class Discover {
  // Discover the initial subscription config for an account.
  static start = async (
    chain: ChainID,
    account: Account
  ): Promise<{ chainState: AnyJson; config: MethodSubscription }> => {
    const { address } = account;

    // Discover on-chain state for account.
    const chainState = await ChainState.get(chain, address);

    // Calculate config from account's chain state.
    const config = Discover.getSubscriptionConfig(chainState);

    return { chainState, config };
  };

  // From chain state, configure subscription config to apply to an account.
  // TODO: remove this, fall back to what is in the store.
  static getSubscriptionConfig = (chainState: SomeChainState) => {
    debug(`🧑🏻‍🔧 Configuring account config with chain state:`);
    debug('⛓️ %o', chainState);

    if (chainState.inNominationPool) {
      debug(`🏖️ This account is in a nomination pool! add events to config...`);
    }

    // Return `all` for now.
    return {
      type: 'all',
    } as All;
  };

  /**
   * @name bootstrapEvents
   * @summary Bootstrap events for all accounts on a chain to prepare the app UI.
   * @param {string=} chain - restrict bootstrapping to a chain.
   */
  static bootstrapEvents = (chain?: ChainID) => {
    const handleBootstrap = (c: ChainID) => {
      if (c && !APIs.get(c)?.api.isReady) {
        // Note: this happens when the user opens the menu or app window before the API instance is
        // connected and `isReady`.
        debug(`❗️ Api for ${c} not ready, skipping bootstrap`);
        return;
      }
      debug(`💳 Bootstrapping for accounts, chain ${chain || 'all chains'}`);

      // TODO: new `eventsCache` to stop querying every time?.
      if (c) ChainState.bootstrap(c);
    };

    if (!chain) {
      for (const c of Object.keys(Accounts.accounts))
        handleBootstrap(c as ChainID);
    } else handleBootstrap(chain);
  };
}
