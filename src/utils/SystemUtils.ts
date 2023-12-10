// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction, AnyJson } from '@/types/misc';
import { WindowsController } from '../controller/WindowsController';
import { APIsController } from '../controller/APIsController';
import { AccountsController } from '../controller/AccountsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import { MainDebug as debug } from '@/utils/DebugUtils';
import { AccountType } from '../types/accounts';
import type { ChainID } from '@/types/chains';

// Initalize store items.
export const initializeState = (id: string) => {
  reportImportedAccounts(id);
  reportActiveInstances(id);
  reportAccountsState(id);
};

// Report connected account state.
export const reportAccountsState = (id: string) => {
  for (const chainAccounts of AccountsController.accounts.values()) {
    chainAccounts.forEach(({ chain, address, state, type }) => {
      if (type === AccountType.User) {
        // TODO: Throw error if state not found
        if (!state) return;

        Object.entries(state.getAllState()).forEach(([key, value]) => {
          debug('🏦 Reporting account state %o', key, value);
          WindowsController.get(id)?.webContents?.send(
            'renderer:account:state',
            chain,
            address,
            key,
            value
          );
        });
      }
    });
  }
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
