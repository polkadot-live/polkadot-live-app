// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BrowserWindow, Tray, nativeImage, ipcMain } from 'electron';
import {
  register as registerLocalShortcut,
  unregisterAll as unregisterAllLocalShortcut,
} from 'electron-localshortcut';
import path from 'path';
import { store } from '@/main';
import { reportOnlineStatus } from '@/utils/SystemUtils';
import { WindowsController } from '@/controller/main/WindowsController';
import { EventsController } from '@/controller/main/EventsController';
import { ConfigMain } from '@/config/ConfigMain';
import type { AnyJson } from '@/types/misc';

/*----------------------------------------------------------------------
 Set up the tray:
 - Load Polkadot Live icon and instantiate an Electron Tray
 - Set tooltip for the tray icon
 - Add `mouse-up` listener in order to toggle the main window
 ----------------------------------------------------------------------*/

export const createTray = () => {
  const iconPath = path.resolve(__dirname, 'assets/IconTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(icon);

  tray.setToolTip('Polkadot Live');

  tray.addListener('mouse-up', () => {
    try {
      WindowsController.toggleVisible('menu');
    } catch (e) {
      console.error(e);
    }
  });
};

/*----------------------------------------------------------------------
 Set up the main window:
 - Instantiates its browser window
 - Loads the correct URL and HTML file
 - Defines event listeners for the window
 - Adds the browser window to WindowsController
 ----------------------------------------------------------------------*/

// TODO: replace AnyJson with concrete type.
export const createMainWindow = (isTest: boolean) => {
  const initialMenuBounds: AnyJson = (store as Record<string, AnyJson>).get(
    'menu_bounds'
  );

  const mainWindow = new BrowserWindow({
    alwaysOnTop: true,
    frame: false,
    x: initialMenuBounds?.x || undefined,
    y: initialMenuBounds?.y || undefined,
    width: initialMenuBounds?.height || 420,
    height: initialMenuBounds?.height || 475,
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

  // Load correct URL and HTML file.
  loadUrlWithRoute(mainWindow, {});

  // Initially hide the menu bar.
  mainWindow.hide();

  // Send port to main window for communication with import window.
  mainWindow.once('ready-to-show', () => {
    const portMain = ConfigMain.getPortsForMainAndImport().portMain;

    mainWindow.webContents.postMessage('port', { target: 'main' }, [portMain]);
  });

  mainWindow.on('show', async () => {
    // Initialize app if necessary.
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

/*----------------------------------------------------------------------
 Prepares a window to be setup when main receives a given IPC message
 - Instantiates or loads an existing browser window
 - Loads the correct URL and HTML file
 - Defines event listeners for the window
 - Adds the browser window to WindowsController
 ----------------------------------------------------------------------*/

// TODO: replace AnyJson with currently used options.
export const handleWindowOnIPC = (
  name: string,
  isTest: boolean,
  options?: AnyJson
) => {
  // Create a call for the window to open.
  ipcMain.handle(`${name}:open`, (_, args?: AnyJson) => {
    // Ensure main window is hidden.
    //WindowsController.hideAndBlur('menu');

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
      width: 800,
      minWidth: 800,
      maxWidth: 800,
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

    registerLocalShortcut(window, 'CmdOrCtrl+Q', () =>
      WindowsController.close(name)
    );
    registerLocalShortcut(window, 'CmdOrCtrl+W', () =>
      WindowsController.close(name)
    );

    // Load correct URL and HTML file.
    loadUrlWithRoute(window, { uri: name, args });

    // Send port to renderer if this is the import window.
    if (name === 'import') {
      window.once('ready-to-show', () => {
        console.log('import window: send port');

        const portImport = ConfigMain.getPortsForMainAndImport().portImport;

        console.log('PORT IMPORT:');
        console.log(portImport);

        window.webContents.postMessage('port', { target: 'import' }, [
          portImport,
        ]);
      });
    }

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
      console.log(`${name} closed`);
    });

    // Have windows controller handle window.
    WindowsController.add(window, name);
    WindowsController.show(name);
  });
};

/*----------------------------------------------------------------------
 Contructs a window's route and loads its HTML file.
 ----------------------------------------------------------------------*/

const loadUrlWithRoute = (
  window: BrowserWindow,
  options: { uri?: string; args?: Record<string, string> }
) => {
  // Dev server routes start with /#/
  // Production routes start with #/
  const uri = options.uri || '';
  const route = `${uri}${
    options.args ? `?${new URLSearchParams(options.args).toString()}` : ''
  }`;

  // Development: load from vite dev server.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#/${route}`);
  } else {
    // Production: load from app build.
    window.loadURL(
      `file://${path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html#/${route}`
      )}`
    );
  }
};
