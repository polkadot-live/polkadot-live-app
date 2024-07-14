// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { WindowsController } from '@/controller/main/WindowsController';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { OnlineStatusController } from '@/controller/main/OnlineStatusController';
import { app } from 'electron';
import type { AnyFunction } from '@/types/misc';

// Hide dock icon if platform is macOS.
// NOTE: We need to wait over a second for the `.hide()` API to work.
// Issue discussed here: https://github.com/electron/electron/issues/37832
export const hideDockIcon = () => {
  if (process.platform === 'darwin') {
    setTimeout(() => {
      app.dock.hide();
    }, 2_000);
  }
};

// Show dock icon.
export const showDockIcon = () => {
  if (process.platform === 'darwin') {
    setTimeout(() => {
      app.dock.show();
    }, 2_000);
  }
};

// Report online status to renderer.
export const reportOnlineStatus = (id: string) => {
  const status = OnlineStatusController.getStatus();

  WindowsController.get(id)?.webContents?.send(
    'renderer:broadcast:onlineStatus',
    status
  );
};

// Report chain subscription tasks to renderer.
export const reportChainSubscriptions = (id: string) => {
  const map = SubscriptionsController.getChainSubscriptions();

  WindowsController.get(id)?.webContents?.send(
    'renderer:broadcast:subscriptions:chains',
    JSON.stringify(Array.from(map))
  );
};

// Call a function for all windows.
export const reportAllWindows = (callback: AnyFunction) => {
  for (const { id } of WindowsController?.active || []) {
    callback(id);
  }
};
