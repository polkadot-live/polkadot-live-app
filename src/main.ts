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
import { AppOrchestrator } from '@/orchestrators/AppOrchestrator';
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
import type { ChainID } from '@/types/chains';
import type {
  DismissEvent,
  EventCallback,
  NotificationData,
} from '@/types/reporter';
import type { FlattenedAccounts } from '@/types/accounts';
import type { IpcTask } from './types/communication';
import type { IpcMainInvokeEvent } from 'electron';
import type { SettingAction } from './renderer/screens/Settings/types';

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

  // Hide dock icon if we're on mac OS.
  const { appHideDockIcon } = ConfigMain.getAppSettings();
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
   * Raw Account management
   */

  ipcMain.handle('main:raw-account', async (_, task: IpcTask) =>
    AddressesController.process(task)
  );

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

  ipcMain.on('main:task:event', (_, task: IpcTask) => {
    switch (task.action) {
      /**
       * Persist an event and show an OS notification if event was persisted.
       * Report event back to frontend after an event UID is assigned.
       */
      case 'events:persist': {
        // Destructure received data.
        interface Target {
          event: EventCallback;
          notification: NotificationData | null;
          isOneShot: boolean;
        }
        const { event, notification, isOneShot }: Target = task.data;

        // Remove any outdated events of the same type, if setting enabled.
        if (!ConfigMain.getAppSettings().appKeepOutdatedEvents) {
          EventsController.removeOutdatedEvents(event);
        }

        // Persist new event to store.
        const { event: eventWithUid, wasPersisted } =
          EventsController.persistEvent(event);

        // Show notification if event was added and notification data was received.
        if ((wasPersisted || isOneShot) && notification) {
          const { title, body, subtitle } = notification;
          NotificationsController.showNotification(title, body, subtitle);
        }

        WindowsController.get('menu')?.webContents?.send(
          'renderer:event:new',
          eventWithUid
        );

        return;
      }
    }
  });

  ipcMain.handle('main:task:event:async', async (_, task: IpcTask) => {
    switch (task.action) {
      /**
       * Update a collection of event's associated account name.
       */
      case 'events:update:accountName': {
        const { address, newName }: { address: string; newName: string } =
          task.data;

        // Update events in storage.
        const updated = EventsController.updateEventAccountName(
          address,
          newName
        );

        // Update account's subscription tasks in storage.
        SubscriptionsController.updateCachedAccountNameForTasks(
          address,
          newName
        );

        // Return updated events in serialized form.
        return JSON.stringify(updated);
      }
    }
  });

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

  ipcMain.handle('main:task:subscription', async (_, task: IpcTask) =>
    SubscriptionsController.process(task)
  );

  /**
   * Interval subscriptions
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

  // Get application docked flag.
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
    if (!['darwin', 'linux'].includes(process.platform)) {
      return;
    }

    // Get new flag.
    const settings = ConfigMain.getAppSettings();
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
  });

  // Toggle an app setting.
  ipcMain.on('app:setting:toggle', (_, action: SettingAction) => {
    const settings = ConfigMain.getAppSettings();

    switch (action) {
      case 'settings:execute:showDebuggingSubscriptions': {
        const flag = !settings.appShowDebuggingSubscriptions;
        settings.appShowDebuggingSubscriptions = flag;

        const key = ConfigMain.settingsStorageKey;
        (store as Record<string, AnyData>).set(key, settings);
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
  });

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
