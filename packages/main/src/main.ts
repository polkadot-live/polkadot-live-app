// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import AutoLaunch from 'auto-launch';
import {
  app,
  clipboard,
  ipcMain,
  Menu,
  powerMonitor,
  protocol,
  shell,
  systemPreferences,
} from 'electron';
import Store from 'electron-store';
import unhandled from 'electron-unhandled';
import { version } from '../package.json';
import { Config as ConfigMain } from './config/main';
import { SharedState } from './config/SharedState';
import {
  AccountsController,
  AddressesController,
  AnalyticsController,
  BackupController,
  ChainEventsController,
  EventsController,
  ExtrinsicsController,
  IntervalsController,
  NotificationsController,
  OnlineStatusController,
  SettingsController,
  SubscriptionsController,
  WindowsController,
} from './controller';
import {
  AccountsRepository,
  AddressesRepository,
  DatabaseManager,
  SettingsRepository,
} from './db';
import { executeLedgerTask, USBController } from './ledger';
import { MainDebug } from './utils/DebugUtils';
import { menuTemplate } from './utils/MenuUtils';
import { hideDockIcon } from './utils/SystemUtils';
import * as WindowUtils from './utils/WindowUtils';
import type { IpcTask, SyncID } from '@polkadot-live/types/communication';
import type { LedgerTask } from '@polkadot-live/types/ledger';
import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { NotificationData } from '@polkadot-live/types/reporter';

const debug = MainDebug;

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

// Ask for camera permission (Mac OS)
const grantCameraPermission = async (): Promise<boolean> => {
  try {
    if (process.platform !== 'darwin') {
      return true;
    }
    const access = systemPreferences.getMediaAccessStatus('camera');
    if (access === 'granted') {
      return true;
    }
    const result = await systemPreferences.askForMediaAccess('camera');
    debug('🔷 Camera permission enabled: %o', result);
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
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

  // Initialize SQLite database and repositories.
  DatabaseManager.initialize(app.getPath('userData'));
  SettingsRepository.initialize();
  AddressesRepository.initialize();
  AccountsRepository.initialize();

  // Hide dock icon if we're on mac OS.
  SettingsController.initialize();
  const appHideDockIcon = SettingsController.get('setting:hide-dock-icon');
  appHideDockIcon && hideDockIcon();

  // Initialize USB controller.
  await USBController.initialize();

  // Initialize shared state cache.
  await OnlineStatusController.initialize();
  const connected = OnlineStatusController.getStatus();
  const dark = SettingsController.get('setting:dark-mode');
  SharedState.initialize(connected, dark);

  // ------------------------------
  // Create windows
  // ------------------------------

  // Create menu bar and tray.
  WindowUtils.createTray();
  WindowUtils.createMainWindow();
  WindowUtils.createBaseWindow();

  // Handle child windows.
  for (const viewId of ['import', 'action', 'openGov', 'settings']) {
    WindowUtils.handleViewOnIPC(viewId);
  }

  // ------------------------------
  // Handle Power Changes
  // ------------------------------

  // Emitted when the system is suspending.
  powerMonitor.on('suspend', async () => {
    await OnlineStatusController.handleSuspend();
  });

  // Emitted when system is resuming.
  powerMonitor.on('resume', async () => {
    await OnlineStatusController.handleResume();
  });

  // Close the database cleanly before the app exits.
  app.on('will-quit', () => {
    DatabaseManager.close();
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
    AddressesController.process(task),
  );

  /**
   * Accounts
   */

  ipcMain.handle(
    'main:task:account',
    async (_, task: IpcTask) => await AccountsController.process(task),
  );

  /**
   * Events
   */

  ipcMain.on('main:task:event', (_, task: IpcTask): void =>
    EventsController.process(task),
  );

  ipcMain.handle('main:task:event:async', async (_, task: IpcTask) =>
    EventsController.processAsync(task),
  );

  /**
   * Extrinsics
   */

  ipcMain.handle('main:task:extrinsics:async', async (_, task: IpcTask) =>
    ExtrinsicsController.processAsync(task),
  );

  /**
   * Online Status
   */

  ipcMain.handle(
    'main:task:connection:async',
    async (_, task: IpcTask) => await OnlineStatusController.processAsync(task),
  );

  /**
   * Subscriptions
   */

  ipcMain.handle('main:task:subscription', async (_, task: IpcTask) =>
    SubscriptionsController.process(task),
  );

  ipcMain.handle('main:task:interval', async (_, task: IpcTask) =>
    IntervalsController.process(task),
  );

  ipcMain.handle('main:task:chainEvents', (_, task: IpcTask) =>
    ChainEventsController.process(task),
  );

  /**
   * OS Notifications
   */

  ipcMain.on(
    'app:notification:show',
    (_, { title, body, subtitle }: NotificationData) => {
      NotificationsController.showNotification(title, body, subtitle);
    },
  );

  /**
   * Platform
   */

  ipcMain.handle('app:grantCamera', async () => await grantCameraPermission());

  ipcMain.handle('app:platform:get', async () => process.platform as string);

  ipcMain.handle('main:clipboard:copy', async (_, text) =>
    clipboard.writeText(text),
  );

  /**
   * Window Management
   */

  // Reize base window.
  ipcMain.on('app:base:resize', (_, size) =>
    WindowsController.resizeBaseWindow(size),
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

  // Open devTools for a view.
  ipcMain.on('app:view:devTools', (_, windowId: string) => {
    WindowsController.openDevTools(windowId);
  });

  /**
   * Settings
   */

  ipcMain.on('main:task:settings', (_, task: IpcTask) =>
    SettingsController.process(task),
  );

  ipcMain.handle('app:settings:get', async () =>
    SettingsController.getAppSettings(),
  );

  /**
   * Shared State
   */

  ipcMain.handle(
    'app:sharedState:get',
    async (_, syncId: SyncID): Promise<string | boolean> =>
      SharedState.get(syncId),
  );

  ipcMain.on(
    'app:sharedState:relay',
    async (_, syncId: SyncID, state: string | boolean) => {
      switch (syncId) {
        case 'mode:connected': {
          // Handle status change.
          await OnlineStatusController.handleStatusChange();
          const status = OnlineStatusController.getStatus();
          SharedState.set('mode:connected', status);

          WindowsController.relaySharedState('renderer:sharedState:set', {
            syncId,
            state: status,
          });

          return;
        }
        case 'mode:dark': {
          // Set the background color for all open windows and views.
          WindowsController.setWindowsBackgroundColor(
            state ? ConfigMain.themeColorDark : ConfigMain.themeColorLight,
          );
          SharedState.set(syncId, state as boolean);
          break;
        }
        default: {
          SharedState.set(syncId, state as boolean);
          break;
        }
      }

      // Relay to renderers.
      WindowsController.relaySharedState('renderer:sharedState:set', {
        syncId,
        state,
      });
    },
  );

  /**
   * Ledger
   */

  // Execute communication with a Ledger device.
  ipcMain.handle(
    'app:ledger:task',
    async (_, task: LedgerTask, serData: string) =>
      await executeLedgerTask(task, serData),
  );

  /**
   * Backup
   */

  // Export a data-file.
  ipcMain.handle(
    'app:data:export',
    async () => await BackupController.export(),
  );

  // Import a data-file.
  ipcMain.handle(
    'app:data:import',
    async () => await BackupController.import(),
  );

  /**
   * Analytics
   */

  ipcMain.on(
    'app:analytics:init',
    (_, agent: string, windowId: string, lang: string) => {
      AnalyticsController.initialize(agent, windowId, lang);
    },
  );

  ipcMain.on('app:umami:event', async (_, event: string, data: AnyData) => {
    AnalyticsController.track(event, data ? data : undefined);
  });
});
