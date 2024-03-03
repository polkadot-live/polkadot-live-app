// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction, AnyJson } from '@/types/misc';
import { WindowsController } from '../controller/WindowsController';
import { APIsController } from '../controller/APIsController';
import { AccountsController } from '../controller/AccountsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import type { ChainID } from '@/types/chains';
import { OnlineStatusController } from '@/controller/OnlineStatusController';

/**
 * @summary Initalize store items.
 * @deprecated
 */
export const initializeState = (id: string) => {
  reportImportedAccounts(id);
  reportApiInstances(id);
};

// Report online status to renderer.
export const reportOnlineStatus = (id: string) => {
  const status = OnlineStatusController.getStatus();

  WindowsController.get(id)?.webContents?.send(
    'renderer:broadcast:onlineStatus',
    status
  );
};

/**
 * @summary Report imported accounts to renderer.
 * @deprecated
 */
export const reportImportedAccounts = (id: string) => {
  const serialized = JSON.stringify(
    Array.from(AccountsController.getAllFlattenedAccountData().entries())
  );

  WindowsController.get(id)?.webContents?.send(
    'renderer:broadcast:accounts',
    serialized
  );
};

// Report subscription tasks for all accounts to renderer.
export const reportAccountSubscriptions = (id: string) => {
  const map = SubscriptionsController.getAccountSubscriptions(
    AccountsController.accounts
  );

  WindowsController.get(id)?.webContents?.send(
    'renderer:broadcast:subscriptions:accounts',
    JSON.stringify(Array.from(map))
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

/**
 * @summary Report active chains to a window.
 * @deprecated
 */
export const reportApiInstances = (id: string) => {
  for (const apiData of APIsController.getAllFlattenedAPIData()) {
    WindowsController.get(id)?.webContents?.send(
      'renderer:chain:sync',
      apiData
    );
  }
};

// TODO: Fix when chain removal is implemented on back-end.
// Remove chain's API instance if no more accounts require it
export const removeUnusedApi = (chain: ChainID) => {
  if (!AccountsController.accounts.get(chain)?.length) {
    APIsController.close(chain);

    // Report to active windows that chain has been removed.
    WindowsController.active.forEach(({ id }: AnyJson) => {
      WindowsController.get(id)?.webContents?.send(
        'renderer:chain:removed',
        chain
      );
    });
  }
};
