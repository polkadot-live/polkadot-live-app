// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { Address } from '@polkadot/types/interfaces/runtime';
import {
  ApiSubscription,
  ConcreteAccount,
  RawAccount,
} from '@polkadot-live/types';
import { ChainID } from '@polkadot-live/types/chains';
import { MainDebug } from '@/debugging';
import { LiveReporter } from '@/model/LiveReporter';
import { APIs } from './APIs';
import { Accounts } from './Accounts';
import { BlockStream } from './BlockStream';
import { Discover } from './Discover';
import { Windows } from './Windows';

const debug = MainDebug.extend('Subscriptions');

// Basic types for services.
type Service = { chain: ChainID; instance: BlockStream };

/**
 * A static class to manage BlockStream subscriptions.
 * @class
 * @property {Service[]} services - list of active BlockStream services.
 */
export class Subscriptions {
  static services: Service[] = [];

  /**
   * @name initialize
   * @summary Initializes subscription services.
   */
  static initialize = async () => {
    debug('🕕 Initializing subscriptions');

    // Instantiate `BlockStream` services from initial chains and account configs.
    APIs.instances.forEach(async ({ chain, api }) => {
      debug('🔴 Using instance %o', chain);

      // Get accounts for `chain` and instantiate service.
      const accounts = Accounts.accounts[chain];
      debug('💳 API instance accounts pre discover: %o', accounts.length);

      const rawAccounts: RawAccount[] = [];
      for (const a of accounts) {
        // Re-discover config from on-chain state.
        const { chainState, config } = await Discover.start(chain, a);

        // Update config for account.
        a.config = config;
        a.chainState = chainState;
        Accounts.set(chain, a);

        debug(
          '🗓️ Bootstrap events for an account with chainState: %o',
          chainState
        );

        // Convert `Account` into `RawAccount`.
        rawAccounts.push({
          address: a.address,
          nickname: a.name,
          config,
        });
      }

      debug('📑 Raw accounts: %o', rawAccounts);

      // Start BlockStream services with raw accounts.
      if (rawAccounts) {
        this.startService(chain, api, rawAccounts);
      }

      // Report accounts to windows with updated configs.
      for (const { id } of Windows.active) {
        Windows.get(id)?.webContents?.send(
          'reportImportedAccounts',
          Accounts.getAll()
        );
      }
    });
  };

  /**
   * @name addAccountToService
   * @summary Adds an account to an existing service, or instantiates a new one if there is no
   * service for the corresponding chain.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {string} address - the account address.
   */
  static addAccountToService = async (chain: ChainID, address: string) => {
    const service = this.services.find((s) => s.chain === chain);

    const account = Accounts.get(chain, address);
    if (!account) {
      return false;
    }

    if (service?.instance) {
      const { instance } = service;
      const concreteAddress = instance.api.createType(
        'Address',
        address
      ) as Address;

      // Remove account if it is already in instance.
      instance.accounts = instance.accounts.filter(
        (a: ConcreteAccount) => !a.address.eq(concreteAddress)
      );

      // Add the account to the instance.
      instance.accounts.push({
        address: concreteAddress,
        nickname: account.name,
        config: account.config,
      });
    } else {
      // get api instance and start service.
      const apiInstance = APIs.instances.find((i) => i.chain === chain);

      if (apiInstance) {
        const rawAccount = {
          address,
          nickname: account.name,
          config: account.config,
        };

        this.startService(apiInstance.chain, apiInstance.api, [rawAccount]);
      } else {
        // Chain instance does not exist (should not happen).
      }
    }
  };

  /**
   * @name removeAccountFromService
   * @summary Removes an account from a subscription service. Shuts down service if there are no
   * more accounts in it.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {string} address - the account address.
   */
  static removeAccountFromService = async (chain: ChainID, address: string) => {
    // Remove account from running instance.
    const service = this.services.find((s) => s.chain === chain);
    if (service?.instance) {
      const { instance } = service;

      instance.accounts = instance.accounts.filter(
        (a) => a.address.toString() !== address
      );

      if (!instance.accounts.length) {
        await instance.unsub();
        this.services = this.services.filter((s) => s.chain !== chain);
      }
    }
  };

  /**
   * @name startService
   * @summary Starts a service.
   * @param {ChainID} chain - the chain the account belongs to.
   * @param {string} api - the api instance to use in a service.
   * @param {RawAccount[]} accounts - the accounts listening to this subscription.
   */
  private static startService = async (
    chain: ChainID,
    api: ApiPromise,
    accounts: RawAccount[]
  ) => {
    if (accounts.length) {
      const instance = new BlockStream(api, chain, [new LiveReporter()], {
        accounts,
        apiSubscription: ApiSubscription.Head,
      });
      instance.start();
      this.services.push({ chain, instance });
    }
  };
}
