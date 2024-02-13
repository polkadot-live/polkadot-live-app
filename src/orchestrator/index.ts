// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  reportAccountSubscriptions,
  reportAllWindows,
  reportImportedAccounts,
} from '@/utils/SystemUtils';
import {
  fetchAccountNominationPoolData,
  fetchNominationPoolDataForAccount,
} from '@/utils/AccountUtils';
import { ChainList } from '@/config/chains';
import { APIsController } from '@/controller/APIsController';
import { AccountsController } from '@/controller/AccountsController';
import { NotificationsController } from '@/controller/NotificationsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import type {
  ImportNewAddressArg,
  OrchestratorArg,
  RemoveImportedAccountArg,
} from '@/types/orchestrator';

// Orchestrate class to perform high-level app tasks.
export class Orchestrator {
  static async next({ task, data = {} }: OrchestratorArg) {
    switch (task) {
      // Initialize app: should only be called once when the app is starting up.
      case 'app:initialize':
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

  // Use API instance to initialize account nomination pool data.
  await fetchAccountNominationPoolData();

  // Initialize persisted account subscriptions.
  await AccountsController.subscribeAccounts();

  // Initialize persisted chain subscriptions.
  await SubscriptionsController.initChainSubscriptions();
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
  if (!account) {
    return;
  }

  // Initialize nomination pool data for account if necessary.
  fetchNominationPoolDataForAccount(account, chain);

  // Report new account to UI immediately (no chain state yet).
  reportAllWindows(reportImportedAccounts);

  // Add chain instance if it does not already exist.
  if (!APIsController.chainExists(chain)) {
    // TODO: handle case where chain list data does not exist.
    const chainData = ChainList.get(chain);

    if (chainData) {
      await APIsController.new(chainData.endpoints.rpc);
    }
  }

  // Report account subscriptions to renderer.
  reportAccountSubscriptions('menu');

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

  if (!account) {
    return;
  }

  // Unsubscribe from all active tasks.
  await AccountsController.removeAllSubscriptions(account);

  // Clear account's persisted tasks in store.
  SubscriptionsController.clearAccountTasksInStore(account);

  // Remove address from store.
  AccountsController.remove(chain, address);

  // Report account subscriptions to renderer.
  reportAccountSubscriptions('menu');

  // TODO: Fix when chain removal is implemented on back-end.
  // Remove chain's API instance if no more accounts require it.
  //removeUnusedApi(chain);

  // Report to all active windows that an address has been removed.
  reportAllWindows(reportImportedAccounts);
};
