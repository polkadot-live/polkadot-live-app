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
import {
  register as registerLocalShortcut,
  unregisterAll as unregisterAllLocalShortcut,
} from 'electron-localshortcut';
import path from 'path';
import { store } from '@/main';
import { hideDockIcon, reportOnlineStatus } from '@/utils/SystemUtils';
import { EventsController } from '@/controller/main/EventsController';
import { SettingsController } from '@/controller/main/SettingsController';
import { WindowsController } from '@/controller/main/WindowsController';
import { Config as ConfigMain } from '@/config/processes/main';
import { MainDebug } from './DebugUtils';
import type { AnyJson } from '@/types/misc';
import type { PortPairID } from '@/types/communication';
import type { Rectangle } from 'electron';

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
  const iconPath = path.resolve(__dirname, 'assets/IconTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(icon);

  tray.setToolTip('Polkadot Live');

  tray.addListener('click', () => {
    try {
      WindowsController.toggleVisible('menu');
    } catch (e) {
      console.error(e);
    }
  });

  // Cache tray in main process config.
  ConfigMain.appTray = tray;
};

/**
 * @name sendMainWindowPorts
 * @summary Send ports to main window to facilitate communication with other windows.
 */
export const sendMainWindowPorts = (mainWindow: BrowserWindow) => {
  mainWindow.webContents.postMessage('port', { target: 'main-import:main' }, [
    ConfigMain.getPortPair('main-import').port1,
  ]);

  mainWindow.webContents.postMessage('port', { target: 'main-action:main' }, [
    ConfigMain.getPortPair('main-action').port1,
  ]);

  mainWindow.webContents.postMessage('port', { target: 'main-settings:main' }, [
    ConfigMain.getPortPair('main-settings').port1,
  ]);

  mainWindow.webContents.postMessage('port', { target: 'main-openGov:main' }, [
    ConfigMain.getPortPair('main-openGov').port1,
  ]);
};

/**
 * @name sendMainWindowPorts
 * @summary Send ports to child windows to facilitate communication with the main window.
 *
 * Currently unused.
 */
export const sendChildWindowPorts = () => {
  const childWindowIds = ['import', 'action', 'main'];

  for (const windowId of childWindowIds) {
    const childWindow = WindowsController.get(windowId);

    if (childWindow) {
      const target = `main-${windowId}:${windowId}`;
      const portId = `main-${windowId}` as PortPairID;

      childWindow.webContents.postMessage('port', { target }, [
        ConfigMain.getPortPair(portId).port2,
      ]);
    }
  }
};

/**
 * @name createMainWindow
 * @summary Set up the main window:
 *
 * - Instantiates its browser window
 * - Loads the correct URL and HTML file
 * - Defines event listeners for the window
 * - Adds the browser window to WindowsController
 *
 * TODO: replace AnyJson with concrete type.
 */
export const createMainWindow = (isTest: boolean) => {
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
    minWidth: 420,
    maxWidth: 420,
    minHeight: 475,
    maxHeight: 1200,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    backgroundColor: '#2b2b2b',
    webPreferences: {
      sandbox: !isTest,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Hide menu bar on Linux and Windows.
  setWindowMenuVisibility(mainWindow);

  // Load correct URL and HTML file.
  loadUrlWithRoute(mainWindow, { args: { windowId: 'main' } });

  mainWindow.once('ready-to-show', () => {
    // Send ports to main window to facilitate communication with other windows.
    sendMainWindowPorts(mainWindow);

    // Freeze window if in docked mode.
    if (SettingsController.getAppSettings().appDocked) {
      mainWindow.setMovable(false);
      mainWindow.setResizable(false);
    }

    // Set all workspaces visibility.
    setAllWorkspaceVisibilityForWindow('menu');

    // Send IPC message to renderer for app Initialization.
    WindowsController.get('menu')?.webContents?.send('renderer:app:initialize');

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
  const baseHeight = 475;

  const defaultX = screenWidth / 2 - baseWidth / 2;
  const defaultY = screenHeight / 2 - baseHeight / 2;

  const baseWindow = new BaseWindow({
    x: defaultX,
    y: defaultY,
    frame: false,
    show: true,
    resizable: true,
    height: baseHeight,
    minHeight: 475,
    maxHeight: 900,
    width: baseWidth,
    minWidth: ConfigMain.childWidth,
    maxWidth: ConfigMain.childWidth,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    closable: true,
    fullscreen: false,
    center: true,
    backgroundColor: '#2b2b2b',
  });

  // Hide menu bar on Linux and Windows.
  setWindowMenuVisibility(baseWindow);

  // TODO: Register local shortcut Ctrl+Q and Ctrl+W

  // Create tabbed WebContentsView and add to base window.
  const webPreferences = { preload: path.join(__dirname, 'preload.js') };
  const tabsView = new WebContentsView({ webPreferences });
  tabsView.setBounds({ x: 0, y: 0, width: baseWidth, height: 60 });
  loadUrlWithRoute(tabsView, { uri: 'tabs', args: { windowId: 'tabs' } });
  baseWindow.contentView.addChildView(tabsView);

  // TODO: Resize tabs view on base window resize.

  // Have windows controller manage window.
  WindowsController.setBaseWindow(baseWindow);
  WindowsController.setTabsView(tabsView);

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

  // Open developer tools.
  tabsView.webContents.openDevTools();

  // Hide dock icon.
  const { appHideDockIcon } = SettingsController.getAppSettings();
  appHideDockIcon && hideDockIcon();
};

/**
 * @name handleViewOnIPC
 * @summary Opens a view under a new tab in the base window.
 */
export const handleViewOnIPC = (name: string, isTest: boolean) => {
  ipcMain.on(`${name}:open`, () => {
    // Show view in base window if it's already created.
    if (WindowsController.viewExists(name)) {
      WindowsController.renderView(name);
      return;
    }

    // Create the view and add it to the base window.
    const webPreferences = {
      sandbox: !isTest,
      preload: path.join(__dirname, 'preload.js'),
    };

    const view = new WebContentsView({ webPreferences });
    view.setBounds({ x: 0, y: 60, width: ConfigMain.childWidth, height: 415 });
    loadUrlWithRoute(view, { uri: name, args: { windowId: name } });

    // Open links with target="_blank" in default browser.
    view.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Add view to active set and render.
    WindowsController.addView(view, name);

    // Send port to view after DOM is ready.
    view.webContents.on('dom-ready', () => {
      debug(`🔷 Send port to ${name} window`);
      view.webContents.postMessage('port', { target: `main-${name}:${name}` }, [
        ConfigMain.getPortPair(`main-${name}` as PortPairID).port2,
      ]);
    });

    // Open developer tools.
    view.webContents.openDevTools();
  });
};

/**
 * @name handleWindowOnIPC
 * @summary Prepares a window to be setup when main receives a given IPC message
 * @deprecated Replaced by handleViewOnIPC
 */
export const handleWindowOnIPC = (
  name: string,
  isTest: boolean,
  options?: AnyJson
) => {
  // Create a call for the window to open.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.on(`${name}:open`, () => {
    // Show window if it already exists.
    if (WindowsController.get(name)) {
      WindowsController.show(name);
      return;
    }

    // Otherwise set up the window.
    const window = new BrowserWindow({
      frame: false,
      show: false,
      resizable: true,
      height: options?.height || 475,
      minHeight: options?.minHeight || 475,
      maxHeight: options?.maxHeight || 900,
      width: ConfigMain.childWidth,
      minWidth: ConfigMain.childWidth,
      maxWidth: ConfigMain.childWidth,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      closable: true,
      movable: true,
      fullscreenable: false,
      center: true,
      backgroundColor: '#2b2b2b',
      webPreferences: {
        sandbox: !isTest,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    // Hide menu bar on Linux and Windows.
    setWindowMenuVisibility(window);

    registerLocalShortcut(window, 'CmdOrCtrl+Q', () =>
      WindowsController.close(name)
    );
    registerLocalShortcut(window, 'CmdOrCtrl+W', () =>
      WindowsController.close(name)
    );

    // Load correct URL with window ID and HTML file.
    loadUrlWithRoute(window, { uri: name, args: { windowId: name } });

    // Send port to respective renderer using its name.
    window.once('ready-to-show', () => {
      debug(`🔷 Send port to ${name} window`);

      window.webContents.postMessage(
        'port',
        { target: `main-${name}:${name}` },
        [ConfigMain.getPortPair(`main-${name}` as PortPairID).port2]
      );
    });

    window.on('focus', () => {
      WindowsController.focus(name);
    });

    window.on('blur', () => {
      WindowsController.blur(name);
    });

    window.on('close', () => {
      unregisterAllLocalShortcut(window);
    });

    window.on('closed', () => {
      WindowsController.remove(name);
    });

    // Open links with target="_blank" in default browser.
    window.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Have windows controller handle window.
    WindowsController.add(window, name);
    WindowsController.show(name);

    // Set all workspaces visibility.
    setAllWorkspaceVisibilityForWindow(name);

    // Hide dock icon.
    const { appHideDockIcon } = SettingsController.getAppSettings();
    appHideDockIcon && hideDockIcon();
  });
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

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // Development: load from vite dev server.
    const cont = window instanceof BrowserWindow ? window : window.webContents;
    cont.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#/${route}`);
  } else {
    // Production: load from app build.
    const cont = window instanceof BrowserWindow ? window : window.webContents;
    cont.loadURL(
      `file://${path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html#${route}`
      )}`
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
  const mainWindow = WindowsController.get('menu');

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
  const window = WindowsController.get(windowId);
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
