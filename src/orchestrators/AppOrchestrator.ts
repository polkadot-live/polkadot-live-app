// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  reportAccountSubscriptions,
  reportAllWindows,
  reportApiInstances,
  reportImportedAccounts,
  reportOnlineStatus,
} from '@/utils/SystemUtils';
import {
  fetchAccountNominationPoolData,
  //fetchNominationPoolDataForAccount,
} from '@/utils/AccountUtils';
import { APIsController } from '@/controller/APIsController';
import { AccountsController } from '@/controller/AccountsController';
import { NotificationsController } from '@/controller/NotificationsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import type {
  ImportNewAddressArg,
  AppOrchestratorArg,
  RemoveImportedAccountArg,
} from '@/types/orchestrator';
import { ChainList } from '@/config/chains';
import { OnlineStatusController } from '@/controller/OnlineStatusController';

// Orchestrate class to perform high-level app tasks.
export class AppOrchestrator {
  static async next({ task, data = {} }: AppOrchestratorArg) {
    switch (task) {
      // Initialize app: should only be called once when the app is starting up.
      case 'app:initialize':
        await this.initialize();
        break;
      // Initialize in online mode.
      case 'app:initialize:online':
        await this.initializeOnline();
        break;
      // Initialize in offline mode.
      case 'app:initialize:offline':
        await this.initializeOffline();
        break;
      // Handle new account import.
      case 'app:account:import':
        await this.importNewAddress(data);
        break;
      // Handle remove imported account.
      case 'app:account:remove':
        await this.removeImportedAccount(data);
        break;
      default:
        break;
    }
  }

  /**
   * @name initialize
   * @summary Initializes app state.
   */
  private static async initialize() {
    await OnlineStatusController.initialize();
  }

  /**
   * @name initializeOffline
   * @summary Sets the app's state correctly for offline mode.
   */
  private static async initializeOffline() {
    // Unsubscribe queryMulti API calls for managed accounts.
    AccountsController.unsubscribeAccounts();

    // Unsubscribe queryMulti API calls for managed chains.
    SubscriptionsController.unsubscribeChains();

    // Disconnect from any active API instances.
    for (const chainId of Array.from(ChainList.keys())) {
      await APIsController.close(chainId);
    }

    // Report online status to renderer.
    reportAllWindows(reportOnlineStatus);
  }

  /**
   * @name initializeOnline
   * @summary Sets the app's state correctly for online mode.
   */
  private static async initializeOnline() {
    // Fetch up-to-date nomination pool data for managed accounts.
    await fetchAccountNominationPoolData();

    // Re-subscribe to managed accounts cached subscription tasks.
    await AccountsController.resubscribeAccounts();

    // Re-subscribe to managed chain subscription tasks.
    await SubscriptionsController.resubscribeAccounts();

    // Report online status to renderer.
    reportAllWindows(reportOnlineStatus);

    // Report fetched nomination pool account data.
    reportAllWindows(reportImportedAccounts);

    // Report account subscriptions.
    reportAllWindows(reportAccountSubscriptions);
  }

  /**
   * @name importNewAddress
   * @summary Imports a new account.
   */
  private static async importNewAddress({
    chain,
    source,
    address,
    name,
  }: ImportNewAddressArg) {
    // Add address to `AccountsController` and give immediate feedback to app.
    const account = AccountsController.add(chain, source, address, name);

    // If account was unsuccessfully added, exit early.
    if (!account) {
      return;
    }

    // Initialize nomination pool data for account if necessary.
    //fetchNominationPoolDataForAccount(account, chain);

    // Report new account to UI immediately (no chain state yet).
    //reportAllWindows(reportImportedAccounts);

    // Report account subscriptions to renderer.
    //reportAccountSubscriptions('menu');

    // Show notification.
    NotificationsController.accountImported(name);

    // Report account again with chain state.
    //reportAllWindows(reportImportedAccounts);
  }

  /**
   * @name removeImportedAccount
   * @summary Removes an imported account.
   */
  private static async removeImportedAccount({
    chain,
    address,
  }: RemoveImportedAccountArg) {
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

    // Report chain connections to UI.
    reportAllWindows(reportApiInstances);

    // Remove chain's API instance if no more accounts require it.
    //removeUnusedApi(chain);

    // Report to all active windows that an address has been removed.
    reportAllWindows(reportImportedAccounts);
  }
}
