// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  BrowserWindow,
  Tray,
  nativeImage,
  ipcMain,
  shell,
  screen,
  BaseWindow,
  WebContentsView,
} from 'electron';
import path, { resolve, join } from 'path';
import { store } from '@/main';
import { hideDockIcon, reportOnlineStatus } from '@/utils/SystemUtils';
import { EventsController } from '@/controller/EventsController';
import { SettingsController } from '@/controller/SettingsController';
import { WindowsController } from '@/controller/WindowsController';
import { Config as ConfigMain } from '@/config/main';
import { MainDebug } from './DebugUtils';
import type { AnyJson } from '@polkadot-live/types/misc';
import type { PortPairID } from '@polkadot-live/types/communication';
import type { Rectangle } from 'electron';

const PACKAGES_PATH = join(__dirname, '../..');
const PRELOAD_PATH = resolve(PACKAGES_PATH, 'preload', 'dist', 'preload.cjs');

const debug = MainDebug.extend('WindowUtils');

/**
 * @name createTray
 * @summary Set up the tray:
 *
 * - Load Polkadot Live icon and instantiate an Electron Tray
 * - Set tooltip for the tray icon
 * - Add `mouse-up` listener in order to toggle the main window
 */
export const createTray = () => {
  const iconPath = path.resolve(__dirname, 'IconTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(icon);

  tray.setToolTip('Polkadot Live');

  tray.addListener('click', () => {
    try {
      WindowsController.toggleWindowVisible('menu');
    } catch (e) {
      console.error(e);
    }
  });

  // Cache tray in main process config.
  ConfigMain.appTray = tray;
};

/**
 * @name getWindowBackgroundColor
 * @returns The correct background color based on the active theme.
 */
const getWindowBackgroundColor = (): string => {
  const { appDarkMode } = SettingsController.getAppSettings();
  return appDarkMode ? ConfigMain.themeColorDark : ConfigMain.themeColorLight;
};

/**
 * @name createMainWindow
 * @summary Set up the main window:
 *
 * - Instantiates its browser window
 * - Loads the correct URL and HTML file
 * - Defines event listeners for the window
 * - Adds the browser window to WindowsController
 */
export const createMainWindow = () => {
  const initialMenuBounds: AnyJson = (store as Record<string, AnyJson>).get(
    'menu_bounds'
  );

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;

  const defaultX = screenWidth / 2 - ConfigMain.dockedWidth / 2;
  const defaultY = screenHeight / 2 - (ConfigMain.dockedHeight / 2) * 1.75;

  const mainWindow = new BrowserWindow({
    alwaysOnTop: true,
    frame: false,
    x: initialMenuBounds?.x || defaultX,
    y: initialMenuBounds?.y || defaultY,
    width: initialMenuBounds?.height || ConfigMain.dockedWidth,
    height: initialMenuBounds?.height || ConfigMain.dockedHeight,
    minWidth: ConfigMain.dockedWidth,
    maxWidth: ConfigMain.dockedWidth,
    minHeight: 475,
    maxHeight: 1200,
    resizable: true,
    minimizable: true,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    backgroundColor: getWindowBackgroundColor(),
    webPreferences: {
      sandbox: true,
      preload: PRELOAD_PATH,
    },
  });

  // Hide menu bar on Linux and Windows.
  setWindowMenuVisibility(mainWindow);

  // Load correct URL and HTML file.
  loadUrlWithRoute(mainWindow, { args: { windowId: 'main' } });

  mainWindow.once('ready-to-show', () => {
    // Freeze window if in docked mode.
    if (SettingsController.getAppSettings().appDocked) {
      mainWindow.setMovable(false);
      mainWindow.setResizable(false);
    }

    // Set all workspaces visibility.
    setAllWorkspaceVisibilityForWindow('menu');

    // Send IPC message to renderer for app Initialization.
    WindowsController.getWindow('menu')?.webContents?.send(
      'renderer:app:initialize'
    );

    // Report online status to renderer.
    reportOnlineStatus('menu');

    // Report persisted events.
    EventsController.initialize();
  });

  mainWindow.on('move', () => {
    try {
      WindowsController.persistMenuBounds();
    } catch (e) {
      console.error(e);
    }
  });

  mainWindow.on('resize', () => {
    try {
      WindowsController.persistMenuBounds();
    } catch (e) {
      console.error(e);
    }
  });

  mainWindow.on('blur', () => {
    WindowsController.blur('menu');
  });

  mainWindow.on('focus', () => {
    WindowsController.focus('menu');
  });

  // Have windows controller handle menu bar.
  WindowsController.add(mainWindow, 'menu');

  try {
    // Move window to saved position.
    WindowsController.moveToMenuBounds();
  } catch (e) {
    console.error(e);
  }
};

/**
 * @name createBaseWindow
 * @summary Creates the base window that will contain tabs and child views.
 */
export const createBaseWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;

  const baseWidth = ConfigMain.childWidth;
  const baseHeight = 500;
  const defaultX = screenWidth / 2 - baseWidth / 2;
  const defaultY = screenHeight / 2 - baseHeight / 2;

  const baseWindow = new BaseWindow({
    alwaysOnTop: true,
    x: defaultX,
    y: defaultY,
    frame: false,
    show: false,
    resizable: true,
    width: baseWidth,
    height: baseHeight,
    minHeight: 300,
    minWidth: 400,
    minimizable: false,
    maximizable: false,
    closable: true,
    fullscreen: false,
    center: true,
    backgroundColor: getWindowBackgroundColor(),
  });

  // Hide base window and menu bar on Linux and Windows.
  setWindowMenuVisibility(baseWindow);

  // TODO: Register local shortcut Ctrl+Q and Ctrl+W

  // Create tabbed WebContentsView and add to base window.
  const webPreferences = {
    preload: PRELOAD_PATH,
  };
  const tabsView = new WebContentsView({ webPreferences });
  const viewHeight = WindowsController.Y_OFFSET;
  tabsView.setBounds({ x: 0, y: 0, width: baseWidth, height: viewHeight });
  tabsView.setBackgroundColor(getWindowBackgroundColor());
  loadUrlWithRoute(tabsView, { uri: 'tabs', args: { windowId: 'tabs' } });
  baseWindow.contentView.addChildView(tabsView);

  // Resize views when base window is resized.
  baseWindow.on('resize', () => {
    WindowsController.resizeViews();
  });
  // Send message to tabs view after window is resized.
  baseWindow.on('resized', () => {
    WindowsController.tabsView?.webContents?.send('renderer:base:resized');
  });
  // Event handlers.
  baseWindow.on('focus', () => {
    WindowsController.focus('base');
  });
  baseWindow.on('blur', () => {
    WindowsController.blur('base');
  });
  baseWindow.on('close', () => {
    WindowsController.close('base');
  });

  // Have windows controller manage window.
  WindowsController.setBaseWindow(baseWindow);
  WindowsController.setTabsView(tabsView);

  // Show base window on all workspaces if setting is enabled.
  const { appShowOnAllWorkspaces } = SettingsController.getAppSettings();
  appShowOnAllWorkspaces && baseWindow.setVisibleOnAllWorkspaces(true);

  // Hide dock icon.
  const { appHideDockIcon } = SettingsController.getAppSettings();
  appHideDockIcon && hideDockIcon();
};

/**
 * @name handleViewOnIPC
 * @summary Opens a view under a new tab in the base window.
 */
export const handleViewOnIPC = (name: string) => {
  ipcMain.on(
    `${name}:open`,
    (_, relayData: { windowId: string; task: string; serData: string }) => {
      // Show view in base window if it's already created.
      if (WindowsController.viewExists(name)) {
        WindowsController.renderView(name);
        WindowsController.addTab(name);
        return;
      }

      // Create the view and add it to the base window.
      const view = new WebContentsView({
        webPreferences: {
          sandbox: true,
          preload: PRELOAD_PATH,
        },
      });

      // Add view to active set and render.
      view.setBackgroundColor(getWindowBackgroundColor());
      loadUrlWithRoute(view, { uri: name, args: { windowId: name } });
      WindowsController.addView(view, name);
      WindowsController.addTab(name);

      // Open links with target="_blank" in default browser.
      view.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
      });

      // Send port to view after DOM is ready.
      view.webContents.on('dom-ready', () => {
        // Initialise a new port pair.
        const pairId: PortPairID = `main-${name}` as PortPairID;
        ConfigMain.initPorts(pairId);
        const { port1, port2 } = ConfigMain.getPortPair(pairId);

        // Send ports to main window and corresponding view.
        debug(`🔷 Send port ${pairId} to main`);
        WindowsController.getWindow('menu')?.webContents.postMessage(
          'port',
          { target: `main-${name}:main` },
          [port1]
        );

        debug(`🔷 Send port ${pairId} to ${name}`);
        view.webContents.postMessage(
          'port',
          { target: `main-${name}:${name}` },
          [port2]
        );

        // Send message to main renderer to do something after the window has loaded.
        if (relayData !== undefined) {
          const { windowId, task, serData } = relayData;
          WindowsController.getWindow('menu')?.webContents?.send(
            'renderer:relay:task',
            windowId,
            task,
            serData
          );
        }
      });
    }
  );
};

/**
 * @name loadUrlWithRoute
 * @summary Contructs a window's route and loads its HTML file.
 */
const loadUrlWithRoute = (
  window: BrowserWindow | WebContentsView,
  options: { uri?: string; args?: Record<string, string> }
) => {
  // Dev server routes start with /#/
  // Production routes start with #/
  const uri = options.uri || '';
  const route = `${uri}${
    options.args ? `?${new URLSearchParams(options.args).toString()}` : ''
  }`;

  if (process.env.VITE_DEV_SERVER_URL) {
    // Development: load from vite dev server.
    const cont = window instanceof BrowserWindow ? window : window.webContents;
    cont.loadURL(`${process.env.VITE_DEV_SERVER_URL}/#/${route}`);
  } else {
    // Production: load from app build.
    const cont = window instanceof BrowserWindow ? window : window.webContents;
    cont.loadURL(
      `file://${path.join(__dirname, `../../renderer/dist/index.html#${route}`)}`
    );
  }
};

/**
 * @name setDockedOnMac
 * @summary Setup main window in docked mode and position under tray icon on macOS.
 */
const setDockedOnMac = (mainWindow: BrowserWindow) => {
  // Get tray bounds.
  const { x: trayX, width: trayWidth } = ConfigMain.getAppTrayBounds();

  // Get screen width.
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  // Calculate window's X position.
  const halfWindowWidth = ConfigMain.dockedWidth / 2;
  const halfTrayWidth = trayWidth / 2;
  let windowX = trayX - halfWindowWidth + halfTrayWidth;

  // Dock window to right side of screen if its calculated position goes off the screen.
  if (windowX + halfWindowWidth > screenWidth) {
    windowX = screenWidth - halfWindowWidth;
  }

  const windowBounds: Rectangle = {
    x: windowX,
    y: 0,
    width: ConfigMain.dockedWidth,
    height: ConfigMain.dockedHeight,
  };

  fixMainWindow(mainWindow, windowBounds);
};

/**
 * @name setDockedOnWindows
 * @summary Setup main window in docked mode and move to top-right of screen on Windows.
 */
const setDockedOnWindows = (mainWindow: BrowserWindow) => {
  // Get screen width.
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  // Calculate window screen bounds.
  const windowBounds: Rectangle = {
    x: screenWidth - ConfigMain.dockedWidth,
    y: 0,
    width: ConfigMain.dockedWidth,
    height: ConfigMain.dockedHeight,
  };

  fixMainWindow(mainWindow, windowBounds);
};

/**
 * @name fixMainWindow
 * @summary Utility to set the main window to a docked state given its window bounds.
 */
const fixMainWindow = (mainWindow: BrowserWindow, windowBounds: Rectangle) => {
  // Set window position and size.
  mainWindow.setBounds(windowBounds);

  // Make window un-moveable when docked.
  mainWindow.setMovable(false);

  // Make window not resizable when docked.
  mainWindow.setResizable(false);

  // Persist window position.
  (store as Record<string, AnyJson>).set('menu_bounds', mainWindow.getBounds());
};

/**
 * @name handleNewDockFlag
 * @summary Handle docking or un-docking the main window.
 */
export const handleNewDockFlag = (isDocked: boolean) => {
  const mainWindow = WindowsController.getWindow('menu');

  if (!mainWindow) {
    throw new Error('Main window not found.');
  }

  // Update storage.
  const settings = SettingsController.getAppSettings();
  settings.appDocked = isDocked;

  const key = ConfigMain.settingsStorageKey;
  (store as Record<string, AnyJson>).set(key, settings);

  // Update window.
  if (isDocked) {
    switch (process.platform) {
      case 'darwin': {
        setDockedOnMac(mainWindow);
        break;
      }
      case 'win32': {
        setDockedOnWindows(mainWindow);
        break;
      }
      default: {
        break;
      }
    }
  } else {
    mainWindow.setMovable(true);
    mainWindow.setResizable(true);
  }
};

/**
 * @name setAllWorkspaceVisibility
 * @summary Sets windows all workspace visibiltiy flag.
 */
export const setAllWorkspaceVisibilityForWindow = (windowId: string) => {
  const window = WindowsController.getWindow(windowId);
  const { appShowOnAllWorkspaces } = SettingsController.getAppSettings();
  window?.setVisibleOnAllWorkspaces(appShowOnAllWorkspaces);
};

/**
 * @name setWindowMenuVisibility
 * @summary Hide the window menu on Linux and Windows.
 */
const setWindowMenuVisibility = (window: BrowserWindow | BaseWindow) => {
  if (process.platform !== 'darwin') {
    window.setAutoHideMenuBar(false);
    window.setMenuBarVisibility(false);
  }
};
