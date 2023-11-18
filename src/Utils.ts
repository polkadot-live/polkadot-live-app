// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountType, AnyFunction, AnyJson } from '@polkadot-live/types';
import { WindowsController } from './controller/WindowsController';
import { APIsController } from './controller/APIsController';
import { mb, store } from './main';
import { BrowserWindow } from 'electron';
import { AccountsController } from './controller/AccountsController';
import { MainDebug as debug } from './debugging';

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
            'reportAccountState',
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
    'reportImportedAccounts',
    AccountsController.getAll()
  );
};

// Save current menu position to store.
export const handleMenuBounds = async (w: BrowserWindow) => {
  if (w.isFocused()) {
    store.set('menu_bounds', mb?.window?.getBounds());
  }
};

// Move window into position from existing `store` value.
export const moveToMenuBounds = () => {
  const storeMenuPos: AnyJson = store.get('menu_bounds');
  if (storeMenuPos) {
    mb?.window?.setPosition(storeMenuPos.x, storeMenuPos.y, false);
  }
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
    WindowsController.get(id)?.webContents?.send('chain:sync', chain);
  }
};
