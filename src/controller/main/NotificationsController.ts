// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Notification } from 'electron';

/**
 * A static class to manage Electron notifications.
 * @class
 */
export class NotificationsController {
  /**
   * @name showNotification
   * @summary Show a native notification directly.
   */
  static showNotification(title: string, body: string) {
    new Notification({ title, body }).show();
  }
}
