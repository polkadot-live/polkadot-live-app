// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction, AnyJson } from '@/types/misc';
import { WindowsController } from '../controller/WindowsController';
import { APIsController } from '../controller/APIsController';
import { AccountsController } from '../controller/AccountsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import type { ChainID } from '@/types/chains';

// Initalize store items.
export const initializeState = (id: string) => {
  reportImportedAccounts(id);
  reportActiveInstances(id);
};

// Report imported accounts to renderer.
export const reportImportedAccounts = (id: string) => {
  WindowsController.get(id)?.webContents?.send(
    'renderer:broadcast:accounts',
    AccountsController.getAllFlattenedAccountData()
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

// Report active chains to a window.
export const reportActiveInstances = (id: string) => {
  for (const { chain } of APIsController.instances) {
    WindowsController.get(id)?.webContents?.send('renderer:chain:sync', chain);
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
