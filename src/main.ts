// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import 'websocket-polyfill';
import type { IpcMainInvokeEvent } from 'electron';
import { app, ipcMain, protocol, shell, systemPreferences } from 'electron';
import Store from 'electron-store';
import { WindowsController } from './controller/WindowsController';
import { APIsController } from './controller/APIsController';
import { ExtrinsicsController } from './controller/ExtrinsicsController';
import AutoLaunch from 'auto-launch';
import {
  reportAllWindows,
  reportApiInstances,
  reportImportedAccounts,
} from './utils/SystemUtils';
import unhandled from 'electron-unhandled';
import { SubscriptionsController } from './controller/SubscriptionsController';
import { AccountsController } from './controller/AccountsController';
import { AppOrchestrator } from './orchestrators/AppOrchestrator';
import { checkAndHandleApiDisconnect } from './utils/ApiUtils';
import { EventsController } from './controller/EventsController';
import { OnlineStatusController } from './controller/OnlineStatusController';
import * as WindowUtils from '@/utils/WindowUtils';
import * as WdioUtils from '@/utils/WdioUtils';
import type { AnyData } from './types/misc';
import type { ChainID } from '@/types/chains';
import type { DismissEvent, EventCallback } from '@/types/reporter';
import type { FlattenedAccountData, FlattenedAccounts } from './types/accounts';
import type { WrappedSubscriptionTasks } from './types/subscriptions';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Expose Electron API to wdio tests
const isTest = process.env.NODE_ENV === 'test';
if (isTest) {
  require('wdio-electron-service/main');
}

// Enable priviledges.
//
// NOTE: These were added for production envrionment. Not a priority to revise, but worth revising
// before the initial release.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'http',
    privileges: {
      standard: true,
      bypassCSP: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: false,
      stream: true,
    },
  },
  {
    scheme: 'https',
    privileges: {
      standard: true,
      bypassCSP: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: false,
      stream: true,
    },
  },
]);

// Catch unhandled errors. Currently used for QR Scanner closure.
unhandled({
  logger: () => {
    console.error();
  },
  showDialog: false,
});

// Start app boostrapping.

// Initialise Electron store.
export const store = new Store();

// Report dismissed event to renderer.
// TODO: move to a Utils file.
const reportDismissEvent = (eventData: DismissEvent) => {
  WindowsController.get('menu')?.webContents?.send(
    'renderer:event:dismiss',
    eventData
  );
};

app.whenReady().then(async () => {
  // Auto launch app on login.
  const autoLaunch = new AutoLaunch({
    name: 'Polkadot Live',
  });
  autoLaunch.isEnabled().then((isEnabled: boolean) => {
    if (!isEnabled) {
      autoLaunch.enable();
    }
  });

  // App initialization process.
  await AppOrchestrator.next({
    task: 'app:initialize',
  });

  // Ask for camera permission (Mac OS)
  if (process.platform === 'darwin' && !isTest) {
    systemPreferences
      .askForMediaAccess('camera')
      .then((result) => {
        console.log(`camera permission enabled: ${result}`);
      })
      .catch((err) => console.error(err));
  }

  // ------------------------------
  // Create windows
  // ------------------------------

  // Create menu bar and tray.
  WindowUtils.createMainWindow(isTest);
  WindowUtils.createTray();

  // Handle Ledger account import.
  WindowUtils.handleWindowOnIPC('import', isTest);

  // Handle action window.
  WindowUtils.handleWindowOnIPC('action', isTest, {
    height: 375,
    minHeight: 375,
    maxHeight: 375,
  });

  // ------------------------------
  // WDIO Custom Electron API
  // ------------------------------

  if (isTest) {
    ipcMain.handle(
      'wdio-electron',
      (_: IpcMainInvokeEvent, cmd: string, params?: AnyData) =>
        WdioUtils.handleWdioApi(cmd, params)
    );
  }

  // ------------------------------
  // IPC handlers
  // ------------------------------

  // General quit app handler.
  ipcMain.handle('app:quit', () => {
    app.quit();
  });

  // Remove event from store.
  ipcMain.handle('app:event:remove', async (_, event: EventCallback) =>
    EventsController.removeEvent(event)
  );

  // Subscription handlers.
  ipcMain.handle(
    'app:subscriptions:task:handle',
    async (_, data: WrappedSubscriptionTasks) => {
      switch (data.type) {
        case 'chain': {
          // Subscribe to task.
          await SubscriptionsController.subscribeChainTask(data.tasks[0]);

          // Update chain tasks in store.
          SubscriptionsController.updateChainTaskInStore(data.tasks[0]);

          break;
        }
        case 'account': {
          // Fetch account task belongs to.
          const account = AccountsController.get(
            data.tasks[0].chainId,
            data.tasks[0].account?.address
          );

          if (!account) {
            return false;
          }

          // Subscribe to the task.
          await SubscriptionsController.subscribeAccountTask(
            data.tasks[0],
            account
          );

          // Update account's tasks in store.
          SubscriptionsController.updateAccountTaskInStore(
            data.tasks[0],
            account
          );

          break;
        }
        default: {
          console.log('Something went wrong...');
          return false;
        }
      }

      // Disconnect from API instance if there are no tasks that require it.
      await checkAndHandleApiDisconnect(data.tasks[0]);

      // Report chain connections to UI.
      reportAllWindows(reportApiInstances);

      return true;
    }
  );

  /**
   * Handle switching between online and offline.
   */

  ipcMain.on('app:connection:status', () => {
    OnlineStatusController.handleStatusChange();
  });

  /**
   * New handlers
   */

  // Send connection status to frontend.
  ipcMain.handle('app:online:status', async () =>
    OnlineStatusController.getStatus()
  );

  // Send stringified persisted accounts to frontend.
  ipcMain.handle('app:accounts:get', async () => {
    const stored = (store as Record<string, AnyData>).get(
      'imported_accounts'
    ) as string;

    return stored ? stored : '';
  });

  // Send stringified persisted account tasks to frontend.
  ipcMain.handle(
    'app:accounts:tasks:get',
    async (_, account: FlattenedAccountData) => {
      const key = `${account.address}_subscriptions`;
      const stored = (store as Record<string, AnyData>).get(key) as string;
      return stored ? stored : '';
    }
  );

  // Set persisted accounts in store.
  ipcMain.on('app:accounts:set', (_, accounts: FlattenedAccounts) => {
    (store as Record<string, AnyData>).set('imported_accounts', accounts);
  });

  // Persist an event and report it back to frontend.
  ipcMain.on('app:event:persist', (_, e: EventCallback) => {
    const eventWithUid = EventsController.persistEvent(e);

    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:new',
      eventWithUid
    );
  });

  // Get persisted chain subscription tasks.
  ipcMain.handle('app:subscriptions:chain:get', async () => {
    const key = 'chain_subscriptions';
    const tasks = (store as Record<string, AnyData>).get(key) as string;
    return tasks ? tasks : '';
  });

  /**
   * Window management handlers.
   */

  // Hides a window by its key.
  ipcMain.on('app:window:hide', (_, id) => {
    WindowsController.hideAndBlur(id);
  });

  // Closes a window by its key.
  ipcMain.on('app:window:close', (_, id) => {
    WindowsController.close(id);
  });

  // Handles the closing of a chain.
  ipcMain.on('app:chain:remove', (_, chain) => {
    APIsController.close(chain);
  });

  // Execute communication with a Ledger device.
  ipcMain.on('app:ledger:do-loop', (_, accountIndex, tasks) => {
    console.debug(accountIndex, tasks);
    // executeLedgerLoop(Windows.get('import'), 'Polkadot', tasks, {
    //   accountIndex,
    // });
  });

  // Attempt an account import.
  ipcMain.on(
    'app:account:import',
    async (_, chain: ChainID, source, address, name) => {
      await AppOrchestrator.next({
        task: 'app:account:import',
        data: { chain, source, address, name },
      });
    }
  );

  // Attempt an account removal.
  ipcMain.on('app:account:remove', async (_, chain, address) => {
    await AppOrchestrator.next({
      task: 'app:account:remove',
      data: { chain, address },
    });
  });

  // Broadcast to all active windows that an address has been updated.
  ipcMain.on('app:request:accounts', () => {
    reportAllWindows(reportImportedAccounts);
  });

  // Initiate a transaction.
  ipcMain.on('app:tx:init', (_, chain, from, nonce, pallet, method, args) => {
    ExtrinsicsController.new(chain, from, nonce, pallet, method, args);
  });

  // Reset transaction.
  ipcMain.on('app:tx:reset', () => {
    ExtrinsicsController.reset();
  });

  // Submit Vault transaction
  ipcMain.on('app:tx:vault:submit', (_, signature) => {
    ExtrinsicsController.setSignature(signature);
    ExtrinsicsController.submit();
  });

  // Request dismiss event
  ipcMain.on('app:event:dismiss', (_, eventData: DismissEvent) => {
    reportDismissEvent(eventData);
  });

  // Open a browser window.
  ipcMain.on('app:url:open', (_, url) => {
    shell.openExternal(url);
  });
});
