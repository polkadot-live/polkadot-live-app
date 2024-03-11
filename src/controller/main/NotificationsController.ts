// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js';
import { Notification } from 'electron';

/**
 * A static class to manage Electron notifications.
 * @class
 */
export class NotificationsController {
  /**
   * @name show
   * @summary Instantiate and show an Electron notification.
   * @param {string} title - The notification's title string.
   * @param {string} body - The notification's body string.
   */
  private static show(title: string, body: string) {
    new Notification({ title, body }).show();
  }

  /**
   * @name showNotification
   * @summary Show a native notification directly.
   */
  static showNotification(title: string, body: string) {
    new Notification({ title, body }).show();
  }

  /**
   * @name balanceChanged
   * @summary Shows notication when an account's balance has changed.
   */
  static balanceChanged(accountName: string, free: BigNumber) {
    const title = `${accountName}`;
    const body = `Free balance: ${free}`;
    this.show(title, body);
  }

  /**
   * @name accountImported
   * @summary Shows a notification for a new account import.
   * @param {string} accountName - Name of the new imported account.
   */
  static accountImported(accountName: string) {
    const title = 'New Account Imported';
    const body = `${accountName} was imported successfully`;
    this.show(title, body);
  }

  /**
   * @name chainNotification
   * @summary Shows a new chain notification when a pallet:method is called.
   * @param {string} accountName - Name of the account performing the action.
   * @param {string} pallet - The pallet being interacted with.
   * @param {string} method - The method within the pallet being called.
   */
  static chainNotification(
    accountName: string,
    pallet: string,
    method: string
  ) {
    const title = 'New Chain Notification';
    const body = `Account ${accountName} with ${pallet}.${method}.`;
    this.show(title, body);
  }

  /**
   * @name transactionSubmitted
   * @summary Shows a notification when a tx has been submitted.
   */
  static transactionSubmitted() {
    const title = 'Transaction Submitted';
    const body = 'Transaction has been submitted and is processing.';
    this.show(title, body);
  }

  /**
   * @name transactionStatus
   * @summary Shows a notification when a tx status changes.
   */
  static transactionStatus(status: string) {
    switch (status) {
      case 'in-block': {
        const title = 'In Block';
        const body = 'Transaction is in block.';
        this.show(title, body);
        break;
      }
      case 'finalized': {
        const title = 'Finalized';
        const body = 'Transaction was finalised.';
        this.show(title, body);
        break;
      }
    }
  }
}
