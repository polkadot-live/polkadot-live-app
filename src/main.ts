// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  app,
  ipcMain,
  powerMonitor,
  protocol,
  shell,
  systemPreferences,
  Menu,
} from 'electron';
import { Config as ConfigMain } from './config/processes/main';
import { executeLedgerLoop } from './ledger';
import Store from 'electron-store';
import AutoLaunch from 'auto-launch';
import unhandled from 'electron-unhandled';
import { AddressesController } from './controller/main/AddressesController';
import { BackupController } from './controller/main/BackupController';
import { EventsController } from '@/controller/main/EventsController';
import { IntervalsController } from './controller/main/IntervalsController';
import { OnlineStatusController } from '@/controller/main/OnlineStatusController';
import { NotificationsController } from './controller/main/NotificationsController';
import { SubscriptionsController } from '@/controller/main/SubscriptionsController';
import { WebsocketsController } from './controller/main/WebsocketsController';
import { WindowsController } from '@/controller/main/WindowsController';
import { WorkspacesController } from './controller/main/WorkspacesController';
import { MainDebug } from './utils/DebugUtils';
import { hideDockIcon, showDockIcon } from './utils/SystemUtils';
import { menuTemplate } from './utils/MenuUtils';
import { version } from '../package.json';
import * as WindowUtils from '@/utils/WindowUtils';
import * as WdioUtils from '@/utils/WdioUtils';
import type { AnyData, AnyJson } from '@/types/misc';
import type { NotificationData } from '@/types/reporter';
import type { IpcTask } from './types/communication';
import type { IpcMainInvokeEvent } from 'electron';
import { AccountsController } from './controller/main/AccountsController';
import { SettingsController } from './controller/main/SettingsController';

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

// Hide application menu (mac OS) if DEBUG env variable doesn't exist.
// NOTE: Showing window on all workspaces disables the application menu.
if (!process.env.DEBUG) {
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
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

// Clear the store if it's the first time opening this version.
// TODO: Implement data migration between versions.
if (!store.has('version')) {
  store.clear();
  (store as Record<string, AnyJson>).set('version', version);
} else {
  const stored = (store as Record<string, AnyJson>).get('version') as string;

  if (stored !== version) {
    store.clear();
    (store as Record<string, AnyJson>).set('version', version);
  }
}

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

  // Hide dock icon if we're on mac OS.
  const { appHideDockIcon } = SettingsController.getAppSettings();
  appHideDockIcon && hideDockIcon();

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
   * Addresses
   */

  ipcMain.handle('main:raw-account', async (_, task: IpcTask) =>
    AddressesController.process(task)
  );

  /**
   * Accounts
   */

  ipcMain.handle(
    'main:task:account',
    async (_, task: IpcTask) => await AccountsController.process(task)
  );

  /**
   * Events
   */

  ipcMain.on('main:task:event', (_, task: IpcTask): void =>
    EventsController.process(task)
  );

  ipcMain.handle('main:task:event:async', async (_, task: IpcTask) =>
    EventsController.processAsync(task)
  );

  /**
   * Online Status
   */

  ipcMain.on(
    'main:task:connection',
    async (_, task: IpcTask) => await OnlineStatusController.process(task)
  );

  ipcMain.handle(
    'main:task:connection:async',
    async (_, task: IpcTask) => await OnlineStatusController.processAsync(task)
  );

  /**
   * Subscriptions (Account)
   */

  ipcMain.handle('main:task:subscription', async (_, task: IpcTask) =>
    SubscriptionsController.process(task)
  );

  /**
   * Subscriptions (Interval)
   */

  ipcMain.handle('main:task:interval', async (_, task: IpcTask) =>
    IntervalsController.process(task)
  );

  /**
   * OS Notifications
   */

  ipcMain.on(
    'app:notification:show',
    (_, { title, body, subtitle }: NotificationData) => {
      NotificationsController.showNotification(title, body, subtitle);
    }
  );

  /**
   * Platform
   */

  ipcMain.handle('app:platform:get', async () => process.platform as string);

  /**
   * Websockets
   */

  // Handle starting the websocket server and return a success flag.
  ipcMain.handle('app:websockets:start', async () => {
    WebsocketsController.startServer();
    return true;
  });

  // Handle stopping the websocket server and return a success flag.
  ipcMain.handle('app:websockets:stop', async () => {
    WebsocketsController.stopServer();
    return true;
  });

  /**
   * Workspaces
   */

  // Handle fetching workspaces from Electron store.
  ipcMain.handle('app:workspaces:fetch', async () =>
    WorkspacesController.fetchPersistedWorkspaces()
  );

  // Handle deleting a workspace from Electron store.
  ipcMain.on('app:workspace:delete', (_, serialised: string) => {
    try {
      WorkspacesController.removeWorkspace(JSON.parse(serialised));
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(error.message);
      }
    }
  });

  // Handle emitting workspace to developer console.
  ipcMain.on('app:workspace:launch', (_, serialised: string) => {
    try {
      WebsocketsController.launchWorkspace(JSON.parse(serialised));
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(error.message);
      }
    }
  });

  /**
   * Window Management
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
   * Settings
   */

  ipcMain.on('main:task:settings', (_, task: IpcTask) => {
    switch (task.action) {
      case 'settings:set:docked': {
        WindowUtils.handleNewDockFlag(task.data.flag);
        break;
      }
      case 'settings:toggle:allWorkspaces': {
        if (!['darwin', 'linux'].includes(process.platform)) {
          return;
        }

        // Get new flag.
        const settings = SettingsController.getAppSettings();
        const flag = !settings.appShowOnAllWorkspaces;

        // Update windows.
        settings.appShowOnAllWorkspaces = flag;
        WindowsController.setVisibleOnAllWorkspaces(flag);

        // Update storage.
        const key = ConfigMain.settingsStorageKey;
        (store as Record<string, AnyData>).set(key, settings);

        // Re-hide dock if we're on macOS.
        // Electron will show the dock icon after calling the workspaces API.
        settings.appHideDockIcon && hideDockIcon();
        break;
      }
      // Toggle an app setting.
      case 'settings:toggle': {
        const settings = SettingsController.getAppSettings();

        switch (task.data.settingAction) {
          case 'settings:execute:showDebuggingSubscriptions': {
            const flag = !settings.appShowDebuggingSubscriptions;
            settings.appShowDebuggingSubscriptions = flag;
            break;
          }
          case 'settings:execute:silenceOsNotifications': {
            const flag = !settings.appSilenceOsNotifications;
            settings.appSilenceOsNotifications = flag;
            break;
          }
          case 'settings:execute:enableAutomaticSubscriptions': {
            const flag = !settings.appEnableAutomaticSubscriptions;
            settings.appEnableAutomaticSubscriptions = flag;
            break;
          }
          case 'settings:execute:enablePolkassembly': {
            const flag = !settings.appEnablePolkassemblyApi;
            settings.appEnablePolkassemblyApi = flag;
            break;
          }
          case 'settings:execute:keepOutdatedEvents': {
            const flag = !settings.appKeepOutdatedEvents;
            settings.appKeepOutdatedEvents = flag;
            break;
          }
          case 'settings:execute:hideDockIcon': {
            const flag = !settings.appHideDockIcon;
            settings.appHideDockIcon = flag;

            // Hide or show dock icon.
            flag ? hideDockIcon() : showDockIcon();
            break;
          }
          default: {
            break;
          }
        }

        const key = ConfigMain.settingsStorageKey;
        (store as Record<string, AnyData>).set(key, settings);
        break;
      }
    }
  });

  // Get app settings.
  ipcMain.handle('app:settings:get', async () =>
    SettingsController.getAppSettings()
  );

  /**
   * Ledger
   */

  // Execute communication with a Ledger device.
  ipcMain.on(
    'app:ledger:do-loop',
    async (_, accountIndex, chainName, tasks) => {
      console.debug(accountIndex, chainName, tasks);
      const importWindow = WindowsController.get('import');

      if (importWindow) {
        await executeLedgerLoop(importWindow, chainName, tasks, {
          accountIndex,
        });
      }
    }
  );

  /**
   * Backup
   */

  // Export a data-file.
  ipcMain.handle(
    'app:data:export',
    async () => await BackupController.export()
  );

  // Import a data-file.
  ipcMain.handle(
    'app:data:import',
    async () => await BackupController.import()
  );
});
