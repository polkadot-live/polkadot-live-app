// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@/types/misc';
import { WindowsController } from '@/controller/main/WindowsController';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { OnlineStatusController } from '@/controller/main/OnlineStatusController';

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
