// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { app, ipcMain, protocol, shell, systemPreferences } from 'electron';
import { Config as ConfigMain } from './config/processes/main';
import { executeLedgerLoop } from './ledger';
import Store from 'electron-store';
import AutoLaunch from 'auto-launch';
import unhandled from 'electron-unhandled';
import { AppOrchestrator } from '@/orchestrators/AppOrchestrator';
import { EventsController } from '@/controller/main/EventsController';
import { OnlineStatusController } from '@/controller/main/OnlineStatusController';
import { NotificationsController } from './controller/main/NotificationsController';
import { SubscriptionsController } from '@/controller/main/SubscriptionsController';
import { WindowsController } from '@/controller/main/WindowsController';
import { MainDebug } from './utils/DebugUtils';
import * as WindowUtils from '@/utils/WindowUtils';
import * as WdioUtils from '@/utils/WdioUtils';
import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type {
  DismissEvent,
  EventCallback,
  NotificationData,
} from '@/types/reporter';
import type { FlattenedAccountData, FlattenedAccounts } from '@/types/accounts';
import type { IpcMainInvokeEvent } from 'electron';
import type { SubscriptionTask } from '@/types/subscriptions';

const debug = MainDebug;

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

  // Ask for camera permission (Mac OS)
  if (process.platform === 'darwin' && !isTest) {
    systemPreferences
      .askForMediaAccess('camera')
      .then((result) => {
        debug('🔷 Camera permission enabled: %o', result);
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

  // Open clicked URL in a browser window.
  ipcMain.on('app:url:open', (_, url) => {
    shell.openExternal(url);
  });

  /**
   * Account management
   */

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
  ipcMain.on('app:account:remove', async (_, address) => {
    await AppOrchestrator.next({
      task: 'app:account:remove',
      data: { address },
    });
  });

  // Send stringified persisted accounts to frontend.
  ipcMain.handle('app:accounts:get', async () => {
    const stored = (store as Record<string, AnyData>).get(
      'imported_accounts'
    ) as string;

    return stored ? stored : '';
  });

  // Set persisted accounts in store.
  ipcMain.on('app:accounts:set', (_, accounts: FlattenedAccounts) => {
    (store as Record<string, AnyData>).set('imported_accounts', accounts);
  });

  /**
   * Events
   */

  // Persist an event and execut OS notification if event was persisted.
  // Report event back to frontend after an event UID is assigned.
  ipcMain.on(
    'app:event:persist',
    (_, e: EventCallback, notification: NotificationData | null) => {
      const { event: eventWithUid, wasPersisted } =
        EventsController.persistEvent(e);

      // Show notification if event was added and notification data was received.
      if (wasPersisted && notification !== null) {
        const { title, body } = notification;
        NotificationsController.showNotification(title, body);
      }

      WindowsController.get('menu')?.webContents?.send(
        'renderer:event:new',
        eventWithUid
      );
    }
  );

  // Update a collection of event's associated account name.
  ipcMain.handle(
    'app:events:update:accountName',
    async (_, address, newName) => {
      // Update events in storage.
      const updated = EventsController.updateEventAccountName(address, newName);

      // Update account's subscription tasks in storage.
      SubscriptionsController.updateCachedAccountNameForTasks(address, newName);

      // Return updated events.
      return updated;
    }
  );

  // Remove event from store.
  ipcMain.handle('app:event:remove', async (_, event: EventCallback) =>
    EventsController.removeEvent(event)
  );

  // Request dismiss event
  ipcMain.on('app:event:dismiss', (_, eventData: DismissEvent) => {
    reportDismissEvent(eventData);
  });

  // Mark event stale.
  ipcMain.on('app:event:stale', (_, uid: string, chainId: ChainID) => {
    // Update persisted event as stale.
    EventsController.persistStaleEvent(uid);

    // Send message to main renderer to update event in react state.
    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:stale',
      uid,
      chainId
    );
  });

  /**
   * Online status
   */

  // Handle initializing online status controller.
  ipcMain.handle('app:connection:init', async () => {
    await OnlineStatusController.initialize();
  });

  // Handle switching between online and offline.
  ipcMain.on('app:connection:status', () => {
    OnlineStatusController.handleStatusChange();
  });

  // Send connection status to frontend.
  ipcMain.handle('app:online:status', async () =>
    OnlineStatusController.getStatus()
  );

  /**
   * Subscriptions
   */

  // Send stringified persisted account tasks to frontend.
  ipcMain.handle(
    'app:accounts:tasks:get',
    async (_, account: FlattenedAccountData) => {
      const key = ConfigMain.getSubscriptionsStorageKeyFor(account.address);
      const stored = (store as Record<string, AnyData>).get(key) as string;
      return stored ? stored : '';
    }
  );

  // Get persisted chain subscription tasks.
  ipcMain.handle('app:subscriptions:chain:get', async () => {
    const key = ConfigMain.getChainSubscriptionsStorageKey();
    const tasks = (store as Record<string, AnyData>).get(key) as string;
    return tasks ? tasks : '';
  });

  // Update a persisted chain subscription task.
  ipcMain.handle(
    'app:subscriptions:chain:update',
    async (_, task: SubscriptionTask) => {
      SubscriptionsController.updateChainTaskInStore(task);
    }
  );

  // Update a persisted account subscription task.
  ipcMain.handle(
    'app:subscriptions:account:update',
    async (_, serializedTask: string, serializedAccount: string) => {
      const task: SubscriptionTask = JSON.parse(serializedTask);
      const account: FlattenedAccountData = JSON.parse(serializedAccount);
      SubscriptionsController.updateAccountTaskInStore(task, account);
    }
  );

  // Show native notifications.
  ipcMain.on('app:notification:show', (_, { title, body }) => {
    NotificationsController.showNotification(title, body);
  });

  /**
   * Window management
   */

  // Hides a window by its key.
  ipcMain.on('app:window:hide', (_, id) => {
    WindowsController.hideAndBlur(id);
  });

  // Closes a window by its key.
  ipcMain.on('app:window:close', (_, id) => {
    WindowsController.close(id);
  });

  /**
   * Ledger
   */

  // Execute communication with a Ledger device.
  ipcMain.on('app:ledger:do-loop', async (_, accountIndex, appName, tasks) => {
    console.debug(accountIndex, appName, tasks);

    const importWindow = WindowsController.get('import');

    if (importWindow) {
      await executeLedgerLoop(importWindow, appName, tasks, {
        accountIndex,
      });
    }
  });
});
