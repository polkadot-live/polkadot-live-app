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
import { executeLedgerLoop } from './ledger';
import Store from 'electron-store';
import AutoLaunch from 'auto-launch';
import unhandled from 'electron-unhandled';
import { AccountsController } from '@/controller/main/AccountsController';
import { AddressesController } from '@/controller/main/AddressesController';
import { BackupController } from '@/controller/main/BackupController';
import { EventsController } from '@/controller/main/EventsController';
import { IntervalsController } from '@/controller/main/IntervalsController';
import { OnlineStatusController } from '@/controller/main/OnlineStatusController';
import { NotificationsController } from '@/controller/main/NotificationsController';
import { SettingsController } from '@/controller/main/SettingsController';
import { SubscriptionsController } from '@/controller/main/SubscriptionsController';
import { WebsocketsController } from '@/controller/main/WebsocketsController';
import { WindowsController } from '@/controller/main/WindowsController';
import { WorkspacesController } from '@/controller/main/WorkspacesController';
import { MainDebug } from '@/utils/DebugUtils';
import { hideDockIcon } from '@/utils/SystemUtils';
import { menuTemplate } from '@/utils/MenuUtils';
import { version } from '../package.json';
import * as WindowUtils from '@/utils/WindowUtils';
import * as WdioUtils from '@/utils/WdioUtils';
import type { AnyData, AnyJson } from '@/types/misc';
import type { IpcTask } from '@/types/communication';
import type { IpcMainInvokeEvent } from 'electron';
import type { NotificationData } from '@/types/reporter';
import { AnalyticsController } from './controller/main/AnalyticsController';

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
  WindowUtils.createBaseWindow();

  // Handle child windows.
  WindowUtils.handleViewOnIPC('import', isTest);
  WindowUtils.handleViewOnIPC('action', isTest);
  WindowUtils.handleViewOnIPC('openGov', isTest);
  WindowUtils.handleViewOnIPC('settings', isTest);

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
   * Subscriptions
   */

  ipcMain.handle('main:task:subscription', async (_, task: IpcTask) =>
    SubscriptionsController.process(task)
  );

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

  ipcMain.handle(
    'main:task:websockets',
    async (_, task: IpcTask): Promise<boolean> =>
      WebsocketsController.process(task)
  );

  /**
   * Workspaces
   */

  ipcMain.on('main:task:workspace', (_, task: IpcTask) =>
    WorkspacesController.process(task)
  );

  ipcMain.handle('app:workspaces:fetch', async () =>
    WorkspacesController.fetchPersistedWorkspaces()
  );

  /**
   * Window Management
   */

  // Hides a window by its key.
  ipcMain.on('app:window:hide', (_, id) => {
    WindowsController.hideAndBlur(id);
  });

  // Closes a window by its key.
  ipcMain.on('app:window:close', (_, id) => {
    // TODO: Make main window id `main` instead of `menu` and sync with windowId.
    const windowId = id === 'main' ? 'menu' : id;
    WindowsController.close(windowId);
  });

  // Show the base window after clicking the restore button.
  ipcMain.on('app:window:restore', (_, windowId) => {
    if (windowId === 'base') {
      WindowsController.show(windowId);
    }
  });

  // Show a tab.
  ipcMain.on('app:view:show', (_, viewId: string) => {
    WindowsController.renderView(viewId);
  });

  // Destroy a view and its associated tab.
  ipcMain.on(
    'app:view:close',
    (_, destroyViewId: string, showViewId: string | null) => {
      if (showViewId) {
        WindowsController.renderView(showViewId);
      }

      // Destroy view to optimize memory.
      WindowsController.removeView(destroyViewId);
    }
  );

  // Open devTools for a view.
  ipcMain.on('app:view:devTools', (_, windowId: string) => {
    WindowsController.openDevTools(windowId);
  });

  /**
   * Settings
   */

  ipcMain.on('main:task:settings', (_, task: IpcTask) =>
    SettingsController.process(task)
  );

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
      const importView = WindowsController.getView('import');

      if (importView) {
        await executeLedgerLoop(importView!, chainName, tasks, {
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

  /**
   * Analytics
   */

  ipcMain.on(
    'app:analytics:init',
    (_, agent: string, windowId: string, lang: string) => {
      AnalyticsController.initialize(agent, windowId, lang);
    }
  );

  ipcMain.on('app:umami:event', async (_, event: string, data: AnyData) => {
    AnalyticsController.track(event, data ? data : undefined);
  });
});
