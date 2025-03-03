// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  app,
  clipboard,
  ipcMain,
  powerMonitor,
  protocol,
  shell,
  systemPreferences,
  Menu,
} from 'electron';
import { executeLedgerTask } from './ledger';
import Store from 'electron-store';
import AutoLaunch from 'auto-launch';
import unhandled from 'electron-unhandled';
import { Config as ConfigMain } from '@/config/main';
import { AccountsController } from '@/controller/AccountsController';
import { AddressesController } from '@/controller/AddressesController';
import { AnalyticsController } from '@/controller/AnalyticsController';
import { BackupController } from '@/controller/BackupController';
import { ExtrinsicsController } from '@/controller/ExtrinsicsController';
import { EventsController } from '@/controller/EventsController';
import { IntervalsController } from '@/controller/IntervalsController';
import { OnlineStatusController } from '@/controller/OnlineStatusController';
import { NotificationsController } from '@/controller/NotificationsController';
import { SettingsController } from '@/controller/SettingsController';
import { SubscriptionsController } from '@/controller/SubscriptionsController';
import { WebsocketsController } from '@/controller/WebsocketsController';
import { WindowsController } from '@/controller/WindowsController';
import { WorkspacesController } from '@/controller/WorkspacesController';
import { MainDebug } from '@/utils/DebugUtils';
import { hideDockIcon } from '@/utils/SystemUtils';
import { menuTemplate } from '@/utils/MenuUtils';
import { version } from '../package.json';
import * as WindowUtils from '@/utils/WindowUtils';
import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { IpcTask, SyncFlag } from '@polkadot-live/types/communication';
import type { NotificationData } from '@polkadot-live/types/reporter';
import type { LedgerTask } from 'packages/types/src';

const debug = MainDebug;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
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
  if (process.platform === 'darwin') {
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
  WindowUtils.createMainWindow();
  WindowUtils.createBaseWindow();

  // Handle child windows.
  WindowUtils.handleViewOnIPC('import');
  WindowUtils.handleViewOnIPC('action');
  WindowUtils.handleViewOnIPC('openGov');
  WindowUtils.handleViewOnIPC('settings');

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
   * Disclaimer
   */
  ipcMain.handle('main:disclaimer:show', async () => {
    const key = ConfigMain.getShowDisclaimerStorageKey();

    if (!store.get(key, false)) {
      store.set(key, true);
      return true;
    } else {
      return false;
    }
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
   * Extrinsics
   */

  ipcMain.handle('main:task:extrinsics:async', async (_, task: IpcTask) =>
    ExtrinsicsController.processAsync(task)
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

  ipcMain.handle('main:clipboard:copy', async (_, text) =>
    clipboard.writeText(text)
  );

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

  // Reize base window.
  ipcMain.on('app:base:resize', (_, size) =>
    WindowsController.resizeBaseWindow(size)
  );

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

  // Minimize one of the main windows.
  ipcMain.on('app:window:minimize', (_, windowId) => {
    if (process.platform === 'linux') {
      WindowsController.minimizeWindow(windowId);
    }
  });

  // Check if a view is currently open.
  ipcMain.handle('app:view:isOpen', (_, viewId: string) =>
    WindowsController.viewExists(viewId)
  );

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

  ipcMain.on('app:modeFlag:relay', (_, syncId: SyncFlag, flag: boolean) => {
    switch (syncId) {
      case 'darkMode': {
        // Persist new flag to store.
        SettingsController.process({
          action: 'settings:set:darkMode',
          data: { flag },
        });

        // Set the background color for all open windows and views.
        const { appDarkMode } = SettingsController.getAppSettings();
        WindowsController.setWindowsBackgroundColor(
          appDarkMode ? ConfigMain.themeColorDark : ConfigMain.themeColorLight
        );
        break;
      }
      case 'isConnected': {
        break;
      }
      case 'isImporting': {
        ConfigMain.importingData = flag;
        break;
      }
      case 'isOnlineMode': {
        ConfigMain.onlineMode = flag;
        break;
      }
      case 'isBuildingExtrinsic': {
        ConfigMain.isBuildingExtrinsic = flag;
        break;
      }
      case 'wc:account:approved': {
        const pv = { ...ConfigMain.wcSyncFlags };
        ConfigMain.wcSyncFlags = { ...pv, wcAccountApproved: flag };
        break;
      }
      case 'wc:account:verifying': {
        const pv = { ...ConfigMain.wcSyncFlags };
        ConfigMain.wcSyncFlags = { ...pv, wcVerifyingAccount: flag };
        break;
      }
      case 'wc:connecting': {
        const pv = { ...ConfigMain.wcSyncFlags };
        ConfigMain.wcSyncFlags = { ...pv, wcConnecting: flag };
        break;
      }
      case 'wc:disconnecting': {
        const pv = { ...ConfigMain.wcSyncFlags };
        ConfigMain.wcSyncFlags = { ...pv, wcDisconnecting: flag };
        break;
      }
      case 'wc:initialized': {
        const pv = { ...ConfigMain.wcSyncFlags };
        ConfigMain.wcSyncFlags = { ...pv, wcInitialized: flag };
        break;
      }
      case 'wc:session:restored': {
        const pv = { ...ConfigMain.wcSyncFlags };
        ConfigMain.wcSyncFlags = { ...pv, wcSessionRestored: flag };
        break;
      }
      default: {
        break;
      }
    }

    // Relay to renderers.
    WindowsController.relayIpc('renderer:modeFlag:set', { syncId, flag });
  });

  ipcMain.handle('app:modeFlag:get', async (_, syncId: SyncFlag) => {
    switch (syncId) {
      case 'isConnected': {
        return OnlineStatusController.getStatus();
      }
      case 'isImporting': {
        return ConfigMain.importingData;
      }
      case 'isOnlineMode': {
        return ConfigMain.onlineMode;
      }
      case 'isBuildingExtrinsic': {
        return ConfigMain.isBuildingExtrinsic;
      }
      case 'wc:account:approved': {
        return ConfigMain.wcSyncFlags.wcAccountApproved;
      }
      case 'wc:account:verifying': {
        return ConfigMain.wcSyncFlags.wcVerifyingAccount;
      }
      case 'wc:connecting': {
        return ConfigMain.wcSyncFlags.wcConnecting;
      }
      case 'wc:disconnecting': {
        return ConfigMain.wcSyncFlags.wcDisconnecting;
      }
      case 'wc:initialized': {
        return ConfigMain.wcSyncFlags.wcInitialized;
      }
      case 'wc:session:restored': {
        return ConfigMain.wcSyncFlags.wcSessionRestored;
      }
      default: {
        return false;
      }
    }
  });

  /**
   * Ledger
   */

  // Execute communication with a Ledger device.
  ipcMain.on('app:ledger:task', async (_, serialized) => {
    interface Target {
      accountIndices: number[];
      chainName: string;
      tasks: LedgerTask[];
    }

    const { accountIndices, chainName, tasks }: Target = JSON.parse(serialized);
    const importView = WindowsController.getView('import')!;

    if (process.env.DEBUG) {
      console.debug(accountIndices, chainName, tasks);
    }

    if (importView) {
      await executeLedgerTask(importView, chainName, tasks, {
        accountIndices,
      });
    }
  });

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
