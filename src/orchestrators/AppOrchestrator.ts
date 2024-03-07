// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

//import {
//  reportAccountSubscriptions,
//  reportAllWindows,
//  reportApiInstances,
//  reportImportedAccounts,
//} from '@/utils/SystemUtils';
//import { AccountsController } from '@/controller/AccountsController';
//import { SubscriptionsController } from '@/controller/SubscriptionsController';
import type {
  ImportNewAddressArg,
  AppOrchestratorArg,
  RemoveImportedAccountArg,
} from '@/types/orchestrator';
import { OnlineStatusController } from '@/controller/OnlineStatusController';
import { WindowsController } from '@/controller/WindowsController';
import { NotificationsController } from '@/controller/NotificationsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';

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
    WindowsController.get('menu')?.webContents?.send(
      'renderer:app:initialize:offline'
    );
  }

  /**
   * @name initializeOnline
   * @summary Sets the app's state correctly for online mode.
   */
  private static async initializeOnline() {
    WindowsController.get('menu')?.webContents?.send(
      'renderer:app:initialize:online'
    );
  }

  /**
   * @name importNewAddress
   * @summary Imports a new account.
   */
  private static async importNewAddress({ name }: ImportNewAddressArg) {
    // Show notification.
    NotificationsController.accountImported(name);
  }

  /**
   * @name removeImportedAccount
   * @summary Removes an imported account.
   */
  private static async removeImportedAccount({
    address,
  }: RemoveImportedAccountArg) {
    // Clear account's persisted tasks in store.
    SubscriptionsController.clearAccountTasksInStore(address);
  }
}
