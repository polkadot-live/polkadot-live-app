// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Notification } from 'electron';

export class NotificationsController {
  static showNotification(title: string, body: string, subtitle?: string) {
    subtitle
      ? new Notification({ title, subtitle, body }).show()
      : new Notification({ title, body }).show();
  }
}
