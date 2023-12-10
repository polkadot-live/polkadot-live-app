// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  removeUnusedApi,
  reportAccountSubscriptions,
  reportAllWindows,
  reportImportedAccounts,
} from '@/utils/SystemUtils';
import { ChainList } from '@/config/chains';
import { Discover } from '@/controller/Discover';
import { APIsController } from '@/controller/APIsController';
import { AccountsController } from '@/controller/AccountsController';
import { NotificationsController } from '@/controller/NotificationsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import * as AccountUtils from '@/utils/AccountUtils';
import type {
  ImportNewAddressArg,
  OrchestratorArg,
  RemoveImportedAccountArg,
} from '@/types/orchestrator';

// Initialise RxJS subject to orchestrate app events.
//export const orchestrator = new Subject<OrchestratorArg>();

export class Orchestrator {
  static async next({ task, data = {} }: OrchestratorArg) {
    switch (task) {
      // Initialize app: should only be called once when the app is starting up.
      case 'initialize':
        await initialize();
        break;
      // Handle new account import.
      case 'app:account:import':
        await importNewAddress(data);
        break;
      // Handle remove imported account.
      case 'app:account:remove':
        await removeImportedAccount(data);
        break;
      default:
        break;
    }
  }
}

/**
 * @name initialize
 * @summary Initializes app state.
 */
const initialize = async () => {
  // Initialize accounts from persisted state.
  AccountsController.initialize();

  // Initialize required chain `APIs` from persisted state.
  const chainIds = AccountsController.getAccountChainIds();

  await APIsController.initialize(chainIds);

  // Bootstrap events for connected accounts (checks pending rewards).
  Discover.bootstrapEvents(chainIds);

  // Now API instances are instantiated, subscribe accounts to API.
  await AccountsController.subscribeAccounts();

  /*-------------------------------------
   SubscriptionsController Initialization
   ------------------------------------*/

  await SubscriptionsController.initGlobalSubscriptions();

  /*-------------------------------------
   BlockStream Specific Initialization
   ------------------------------------*/

  // Initialize account chainState and config (requires api controller)
  await AccountUtils.initializeConfigsAndChainStates();

  // Initialize discovery of subscriptions for saved accounts.
  // BlockStreamsController.initialize();
};

/**
 * @name importNewAddress
 * @summary Imports a new account.
 */
const importNewAddress = async ({
  chain,
  source,
  address,
  name,
}: ImportNewAddressArg) => {
  // Add address to `AccountsController` and give immediate feedback to app.
  const account = AccountsController.add(chain, source, address, name);

  // If account was unsuccessfully added, exit early.
  if (!account) return;

  // Report new account to UI immediately (no chain state yet).
  reportAllWindows(reportImportedAccounts);

  // Add chain instance if it does not already exist.
  // TODO: Error checking instead of `!`
  if (!APIsController.chainExists(chain)) {
    await APIsController.new(ChainList.get(chain)!.endpoints.rpc);
  }

  // Report account subscriptions to renderer.
  reportAccountSubscriptions('menu');

  /* START: OLD SUBSCRIPTION MODEL ------------------------------- */
  // Check any pending rewards.
  Discover.bootstrapEventsForAccount(chain, account);

  // Instantiate PolkadotState and call subscribe().
  account.initState();

  // Trigger Discovery and generate config.
  const config = await Discover.start(chain, account);

  // Update account's config and chain state.
  AccountsController.setAccountConfig(config, account);

  // Add Account to a `BlockStream` service.
  //BlockStreamsController.addAccountToService(chain, address);
  /* END: OLD SUBSCRIPTION MODEL --------------------------------- */

  // Show notification.
  NotificationsController.accountImported(name);

  // Report account again with chain state.
  reportAllWindows(reportImportedAccounts);
};

/**
 * @name removeImportedAccount
 * @summary Removes an imported account.
 */
const removeImportedAccount = async ({
  chain,
  address,
}: RemoveImportedAccountArg) => {
  // Retrieve the account.
  const account = AccountsController.get(chain, address);

  if (!account) return;

  // Unsubscribe from all active tasks.
  await AccountsController.removeAllSubscriptions(account);

  // Remove address from store.
  AccountsController.remove(chain, address);

  // Report account subscriptions to renderer.
  reportAccountSubscriptions('menu');

  // Remove chain's API instance if no more accounts require it.
  removeUnusedApi(chain);

  // Remove config from `Subscriptions`.
  //BlockStreamsController.removeAccountFromService(chain, address);

  // Report to all active windows that an address has been removed.
  reportAllWindows(reportImportedAccounts);
};
