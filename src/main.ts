// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  app,
  dialog,
  ipcMain,
  powerMonitor,
  protocol,
  shell,
  systemPreferences,
} from 'electron';
import { Config as ConfigMain } from './config/processes/main';
import { executeLedgerLoop } from './ledger';
import Store from 'electron-store';
import AutoLaunch from 'auto-launch';
import unhandled from 'electron-unhandled';
import { promises as fsPromises } from 'fs';
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
import type { AnyJson } from '@w3ux/utils/types';
import type {
  SubscriptionTask,
  IntervalSubscription,
} from '@/types/subscriptions';

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
  WindowUtils.createTray();
  WindowUtils.createMainWindow(isTest);

  // Handle import window.
  WindowUtils.handleWindowOnIPC('import', isTest);

  // Handle action window.
  WindowUtils.handleWindowOnIPC('action', isTest, {
    height: 375,
    minHeight: 375,
    maxHeight: 375,
  });

  // Handle settings window.
  WindowUtils.handleWindowOnIPC('settings', isTest);

  // Handle open gov window.
  WindowUtils.handleWindowOnIPC('openGov', isTest);

  // ------------------------------
  // Handle Power Changes
  // ------------------------------

  // Emitted when the system is suspending.
  powerMonitor.on('suspend', async () => {
    await OnlineStatusController.handleSuspend();
  });

  // Emitted when system is resuming.
  powerMonitor.on('resume', async () => {
    console.log('Resuming...');
    await OnlineStatusController.handleResume();
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
  ipcMain.handle('app:accounts:set', async (_, accounts: FlattenedAccounts) => {
    (store as Record<string, AnyData>).set('imported_accounts', accounts);
  });

  /**
   * Events
   */

  // Persist an event and execut OS notification if event was persisted.
  // Report event back to frontend after an event UID is assigned.
  ipcMain.on(
    'app:event:persist',
    (
      _,
      e: EventCallback,
      notification: NotificationData | null,
      isOneShot: boolean
    ) => {
      // Remove any outdated events of the same type.
      EventsController.removeOutdatedEvents(e);

      // Persist new event to store.
      const { event: eventWithUid, wasPersisted } =
        EventsController.persistEvent(e);

      // Show notification if event was added and notification data was received.
      if ((wasPersisted || isOneShot) && notification !== null) {
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
  ipcMain.on('app:connection:status', async () => {
    await OnlineStatusController.handleStatusChange();
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
  ipcMain.on(
    'app:notification:show',
    (_, { title, body }: NotificationData) => {
      NotificationsController.showNotification(title, body);
    }
  );

  /**
   * Interval subscriptions
   */

  // Get interval subscriptions from store.
  ipcMain.handle('app:interval:tasks:get', async () => {
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyJson> = store;
    const stored: string = storePointer.get(key) || '[]';
    return stored;
  });

  // Clear interval subscriptions from store.
  ipcMain.handle('app:interval:tasks:clear', async () => {
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyJson> = store;
    storePointer.delete(key);
    return 'done';
  });

  // Add interval subscription to store.
  ipcMain.handle('app:interval:task:add', async (_, serialized: string) => {
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyJson> = store;

    const stored: IntervalSubscription[] = storePointer.get(key)
      ? JSON.parse(storePointer.get(key) as string)
      : [];

    stored.push(JSON.parse(serialized));
    storePointer.set(key, JSON.stringify(stored));
  });

  // Add interval subscription to store.
  ipcMain.handle('app:interval:task:remove', async (_, serialized: string) => {
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyJson> = store;

    const stored: IntervalSubscription[] = storePointer.get(key)
      ? JSON.parse(storePointer.get(key) as string)
      : [];

    const task: IntervalSubscription = JSON.parse(serialized);
    const { action, chainId, referendumId } = task;
    const filtered = stored.filter(
      (t) =>
        !(
          t.action === action &&
          t.chainId === chainId &&
          t.referendumId === referendumId
        )
    );

    storePointer.set(key, JSON.stringify(filtered));
  });

  // Update an interval subscription in the store.
  ipcMain.handle('app:interval:task:update', async (_, serialized: string) => {
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyJson> = store;

    const task: IntervalSubscription = JSON.parse(serialized);
    const { action, chainId, referendumId } = task;

    const stored: IntervalSubscription[] = storePointer.get(key)
      ? JSON.parse(storePointer.get(key) as string)
      : [];

    const updated = stored.map((t) =>
      t.action === action &&
      t.chainId === chainId &&
      t.referendumId === referendumId
        ? task
        : t
    );

    storePointer.set(key, JSON.stringify(updated));
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

  // Get applicated docked flag.
  ipcMain.handle(
    'app:docked:get',
    async () => ConfigMain.getAppSettings().appDocked
  );

  // Set application docked flag.
  ipcMain.on('app:docked:set', (_, flag) => {
    WindowUtils.handleNewDockFlag(flag);
  });

  // Get app settings.
  ipcMain.handle('app:settings:get', async () => ConfigMain.getAppSettings());

  ipcMain.on('app:set:workspaceVisibility', () => {
    // Get new flag.
    const settings = ConfigMain.getAppSettings();
    const flag = !settings.appShowOnAllWorkspaces;

    // Update windows.
    settings.appShowOnAllWorkspaces = flag;
    WindowsController.setVisibleOnAllWorkspaces(flag);

    // Update storage.
    const key = ConfigMain.settingsStorageKey;
    (store as Record<string, AnyData>).set(key, settings);
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

  /**
   * Data
   */

  // Export a data-file.
  ipcMain.handle('app:data:export', async (_, serialized) => {
    if (!ConfigMain.exportingData) {
      ConfigMain.exportingData = true;

      // Get response from dialog.
      const window = WindowsController.get('settings');
      if (!window) {
        return { result: false, msg: 'error' };
      }

      const { canceled, filePath } = await dialog.showSaveDialog(window, {
        title: 'Export Data',
        defaultPath: 'polkadot-live-data.txt',
        filters: [
          {
            name: 'Text Files',
            extensions: ['txt'],
          },
        ],
        properties: [],
      });

      // Handle save or cancel.
      if (!canceled && filePath) {
        try {
          await fsPromises.writeFile(filePath, serialized, {
            encoding: 'utf8',
          });

          ConfigMain.exportingData = false;
          return { result: true, msg: 'success' };
        } catch (err) {
          ConfigMain.exportingData = false;
          return { result: false, msg: 'error' };
        }
      } else {
        ConfigMain.exportingData = false;
        return { result: false, msg: 'canceled' };
      }
    }

    // Export dialog is already open.
    return { result: false, msg: 'executing' };
  });

  // Import a data-file.
  ipcMain.handle('app:data:import', async () => {
    const window = WindowsController.get('settings');
    if (!window) {
      return { result: false, msg: 'error' };
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      title: 'Import Data',
      filters: [
        {
          name: 'Text Files',
          extensions: ['txt'],
        },
      ],
      properties: ['openFile'],
    });

    if (!canceled && filePaths.length) {
      try {
        const serialized = await fsPromises.readFile(filePaths[0], {
          encoding: 'utf-8',
        });
        return { result: true, msg: 'success', data: { serialized } };
      } catch (err) {
        return { result: false, msg: 'error' };
      }
    } else {
      return { result: false, msg: 'canceled' };
    }
  });
});
