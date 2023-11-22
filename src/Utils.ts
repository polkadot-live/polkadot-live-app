// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@/types/misc';
import { WindowsController } from './controller/WindowsController';
import { APIsController } from './controller/APIsController';
import { AccountsController } from './controller/AccountsController';
import { MainDebug as debug } from '@/utils/DebugUtils';
import { AccountType } from './types/accounts';

// Initalize store items.
export const initializeState = (id: string) => {
  reportImportedAccounts(id);
  reportActiveInstances(id);
  reportAccountsState(id);
};

// Report connected account state.
export const reportAccountsState = (id: string) => {
  Object.values(AccountsController.accounts).forEach((chainAccounts) => {
    chainAccounts.forEach(({ chain, address, state, type }) => {
      if (type === AccountType.User) {
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
  });
};

// Report imported accounts to renderer.
export const reportImportedAccounts = (id: string) => {
  WindowsController.get(id)?.webContents?.send(
    'renderer:broadcast:accounts',
    AccountsController.getAll()
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
