// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ImportNewAddressArg,
  AppOrchestratorArg,
  RemoveImportedAccountArg,
} from '@/types/orchestrator';
import { WindowsController } from '@/controller/main/WindowsController';
import { NotificationsController } from '@/controller/main/NotificationsController';
import { SubscriptionsController } from '@/controller/main/SubscriptionsController';

// Orchestrate class to perform high-level app tasks.
export class AppOrchestrator {
  static async next({ task, data = {} }: AppOrchestratorArg) {
    switch (task) {
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
   * @name initializeOffline
   * @summary Sets the app's state correctly for offline mode.
   */
  private static async initializeOffline() {
    WindowsController.getWindow('menu')?.webContents?.send(
      'renderer:app:initialize:offline'
    );
  }

  /**
   * @name initializeOnline
   * @summary Sets the app's state correctly for online mode.
   */
  private static async initializeOnline() {
    WindowsController.getWindow('menu')?.webContents?.send(
      'renderer:app:initialize:online'
    );
  }

  /**
   * @name importNewAddress
   * @summary Imports a new account.
   */
  private static async importNewAddress({ name }: ImportNewAddressArg) {
    // Show notification.
    NotificationsController.showNotification('Account Imported', name);
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
