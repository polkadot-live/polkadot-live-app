import 'websocket-polyfill';
import {
  app,
  BrowserWindow,
  ipcMain,
  nativeImage,
  protocol,
  shell,
  Tray,
} from 'electron';
import path from 'path';
import Store from 'electron-store';
import { WindowsController } from './controller/WindowsController';
import { APIsController } from './controller/APIsController';
import { orchestrator } from './orchestrator';
import {
  register as registerLocalShortcut,
  unregisterAll as unregisterAllLocalShortcut,
} from 'electron-localshortcut';
import { ExtrinsicsController } from './controller/ExtrinsicsController';
import { Discover } from './controller/Discover';
import AutoLaunch from 'auto-launch';
import {
  handleMenuBounds,
  initializeState,
  moveToMenuBounds,
  reportAllWindows,
  reportImportedAccounts,
} from './Utils';
import unhandled from 'electron-unhandled';
import type { AnyJson } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type { DismissEvent } from '@/types/reporter';

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

// App initialization process.
orchestrator.next({
  task: 'initialize',
});

// Report dismissed event to renderer.
// TODO: move to a Utils file.
const reportDismissEvent = (eventData: DismissEvent) => {
  WindowsController.get('menu')?.webContents?.send(
    'renderer:event:dismiss',
    eventData
  );
};

// Initialise menubar window.
// TODO: move to a Utils  / store helper file.
// TODO: replace AnyJson with concrete type.
const initialMenuBounds: AnyJson = store.get('menu_bounds');

const createMenuBar = () => {
  const mb = new BrowserWindow({
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
    backgroundColor: '#2b2b2b', // TODO: Make theme setting
    webPreferences: {
      // turn off sandboxing if testing with wdio.
      sandbox: !isTest,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mb.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mb.loadURL(
      `file://${path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
      )}`
    );
  }

  // Initially hide the menu bar.
  mb.hide();

  return mb;
};

// TODO: Create menu bar model.
export let mb: BrowserWindow;

const createTray = () => {
  const iconPath = path.resolve(__dirname, 'assets/IconTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(icon);

  tray.setToolTip('Polkadot Live');

  tray.addListener('mouse-up', () => {
    // TODO: Throw error
    if (!mb) return;

    if (mb?.isVisible()) {
      WindowsController.hideAndBlur('menu');
    } else {
      WindowsController.show('menu');
    }
  });
};

// Initialise a window.
// TODO: replace AnyJson with currently used options.
const handleOpenWindow = (name: string, options?: AnyJson) => {
  // Create a call for the window to open.
  ipcMain.handle(`${name}:open`, (_, args?: AnyJson) => {
    // Ensure menu is hidden.
    if (mb.isVisible()) {
      mb.hide();
    }

    // Either creates a window or focuses an existing one.
    const window = WindowsController.get(name);
    if (window) {
      window.show();
    } else {
      // Handle window.
      const w = new BrowserWindow({
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
        backgroundColor: '#2b2b2b', // TODO: Make theme setting
        webPreferences: {
          // turn off sandboxing if testing with wdio.
          sandbox: !isTest,
          preload: path.join(__dirname, 'preload.js'),
        },
      });

      // NOTE: Dev server routes start with /#/
      //       Production routes start with #/
      const route = `${name}${
        args ? `?${new URLSearchParams(args).toString()}` : ''
      }`;

      // Development: load from vite dev server.
      if (!app.isPackaged && MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        w.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#/${route}`);
      } else {
        // Production: load from app build.
        w.loadURL(
          `file://${path.join(
            __dirname,
            `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html#/${route}`
          )}`
        );
      }
      w.show();

      WindowsController.add(w, name);

      registerLocalShortcut(w, 'CmdOrCtrl+Q', () =>
        WindowsController.close(name)
      );
      registerLocalShortcut(w, 'CmdOrCtrl+W', () =>
        WindowsController.close(name)
      );

      // populate items from store and report.
      w.on('ready-to-show', () => {
        initializeState(name);
      });

      w.on('focus', () => {
        WindowsController.focus(name);
      });
      w.on('blur', () => {
        WindowsController.blur(name);
      });
      w.on('close', () => {
        unregisterAllLocalShortcut(w);
      });
      w.on('closed', () => {
        WindowsController.remove(name);
      });
    }
  });
};

app.whenReady().then(() => {
  // Auto launch app on login.
  const autoLaunch = new AutoLaunch({
    name: 'Polkadot Live',
  });
  autoLaunch.isEnabled().then((isEnabled: boolean) => {
    if (!isEnabled) autoLaunch.enable();
  });

  // Create menu bar and tray.
  mb = createMenuBar();
  WindowsController.add(mb, 'menu');
  createTray();

  mb.on('show', () => {
    // TODO: Throw error
    if (!mb) return;

    // Populate items from store.
    initializeState('menu');

    // Bootstrap account events for all chains.
    Discover.bootstrapEvents();

    // Listen to window movements.
    mb?.addListener('move', () => {
      if (mb) handleMenuBounds(mb);
    });

    mb?.addListener('resize', () => {
      if (mb) handleMenuBounds(mb);
    });

    // Move window to saved position.
    moveToMenuBounds();
  });

  mb.on('blur', () => {
    WindowsController.blur('menu');
  });

  mb.on('focus', () => {
    WindowsController.focus('menu');
  });

  // Handle Ledger account import.
  handleOpenWindow('import');

  // Handle action window.
  handleOpenWindow('action', {
    height: 375,
    minHeight: 375,
    maxHeight: 375,
  });

  // IPC handlers.

  // General quit app handler.
  ipcMain.handle('app:quit', () => {
    app.quit();
  });

  // Window management handlers.

  // Hides a window by its key.
  ipcMain.on('app:window:hide', (_, id) => {
    WindowsController.hideAndBlur(id);
  });

  // Closes a window by its key.
  ipcMain.on('app:window:close', (_, id) => {
    WindowsController.close(id);
  });

  // Handles the closing of a chain.
  ipcMain.on('app:chain:remove', (_, chain) => {
    APIsController.close(chain);
  });

  // Execute communication with a Ledger device.
  ipcMain.on('app:ledger:do-loop', (_, accountIndex, tasks) => {
    console.debug(accountIndex, tasks);
    // executeLedgerLoop(Windows.get('import'), 'Polkadot', tasks, {
    //   accountIndex,
    // });
  });

  // Attempt an account import.
  ipcMain.on(
    'app:account:import',
    async (_, chain: ChainID, source, address, name) => {
      orchestrator.next({
        task: 'newAddressImported',
        data: { chain, source, address, name },
      });
    }
  );

  // Attempt an account removal.
  ipcMain.on('app:account:remove', (_, chain, address) => {
    orchestrator.next({
      task: 'removeImportedAccount',
      data: { chain, address },
    });
  });

  // Broadcast to all active windows that an address has been updated.
  ipcMain.on('app:request:accounts', () => {
    reportAllWindows(reportImportedAccounts);
  });

  // Initiate a transaction.
  ipcMain.on('app:tx:init', (_, chain, from, nonce, pallet, method, args) => {
    ExtrinsicsController.new(chain, from, nonce, pallet, method, args);
  });

  // Reset transaction.
  ipcMain.on('app:tx:reset', () => {
    ExtrinsicsController.reset();
  });

  // Submit Vault transaction
  ipcMain.on('app:tx:vault:submit', (_, signature) => {
    ExtrinsicsController.setSignature(signature);
    ExtrinsicsController.submit();
  });

  // Request dismiss event
  ipcMain.on('app:event:dismiss', (_, eventData: DismissEvent) => {
    reportDismissEvent(eventData);
  });

  // Open a browser window.
  ipcMain.on('app:url:open', (_, url) => {
    shell.openExternal(url);
  });
});
