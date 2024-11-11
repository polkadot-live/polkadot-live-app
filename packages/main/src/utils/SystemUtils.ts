// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { WindowsController } from '@/controller/WindowsController';
import { OnlineStatusController } from '@/controller/OnlineStatusController';
import { app } from 'electron';
import type { AnyFunction } from '@polkadot-live/types/misc';

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

// Report online status to a managed browser window renderer.
export const reportOnlineStatus = (id: string) => {
  const status = OnlineStatusController.getStatus();

  WindowsController.getWindow(id)?.webContents?.send(
    'renderer:broadcast:onlineStatus',
    status
  );
};

// Call a function for all windows.
export const reportAllWindows = (callback: AnyFunction) => {
  for (const { id } of WindowsController?.active || []) {
    callback(id);
  }
};
