import 'websocket-polyfill';
import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { WindowsController } from './controller/WindowsController';
import { AnyJson, DismissEvent } from '@polkadot-live/types';
import { menubar } from 'menubar';
import { APIs } from './controller/APIs';
import { orchestrator } from './orchestrator';
import {
  register as registerLocalShortcut,
  unregisterAll as unregisterAllLocalShortcut,
} from 'electron-localshortcut';
import { ChainID } from '@polkadot-live/types/chains';
import { Extrinsic } from './controller/Extrinsic';
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

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
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
    'reportDismissEvent',
    eventData
  );
};

// Initialise menubar window.
// TODO: move to a Utils  / store helper file.
// TODO: replace AnyJson with concrete type.
const initialMenuBounds: AnyJson = store.get('menu_bounds');

export const mb = menubar({
  index: MAIN_WINDOW_VITE_DEV_SERVER_URL,
  // NOTE: use `process.platform` to determine windows icons.
  icon: path.resolve(__dirname, 'assets/IconTemplate.png'),
  browserWindow: {
    alwaysOnTop: true,
    frame: false,
    x: initialMenuBounds?.x || undefined,
    y: initialMenuBounds?.y || undefined,
    width: initialMenuBounds?.height || 420,
    minWidth: 420,
    maxWidth: 420,
    height: initialMenuBounds?.height || 475,
    minHeight: 475,
    maxHeight: 1200,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  },
});

// Initialise a window.
// TODO: replace AnyJson with currently used options.
const handleOpenWindow = (name: string, options?: AnyJson) => {
  // Create a call for the window to open.
  ipcMain.handle(`${name}:open`, (_, args?: AnyJson) => {
    // Ensure menu is hidden.
    mb.hideWindow();

    // Either creates a window or focuses an existing one.
    if (WindowsController.get(name)) {
      WindowsController.get(name).show();
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
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
        },
      });

      w.loadURL(
        `${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#/${name}${
          args ? `?${new URLSearchParams(args).toString()}` : ''
        }`
      );
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

mb.on('ready', () => {
  // Auto launch app on login.
  const autoLaunch = new AutoLaunch({
    name: 'Polkadot Live',
  });
  autoLaunch.isEnabled().then((isEnabled: boolean) => {
    if (!isEnabled) autoLaunch.enable();
  });

  mb.on('show', () => {
    WindowsController.add(mb.window, 'menu');
    WindowsController.focus('menu');

    // Populate items from store.
    initializeState('menu');
  });

  mb.on('after-show', () => {
    // Bootstrap account events for all chains.
    Discover.bootstrapEvents();

    // Listen to window movements.
    mb.window?.addListener('move', () => {
      if (mb?.window) handleMenuBounds(mb.window);
    });

    mb.window?.addListener('resize', () => {
      if (mb?.window) handleMenuBounds(mb.window);
    });

    // Move window to saved position.
    moveToMenuBounds();
  });

  mb.on('focus-lost', () => {
    WindowsController.blur('menu');
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
  ipcMain.handle('quit-app', () => {
    app.quit();
  });

  // Window management handlers.

  // Hides a window by its key.
  ipcMain.on('hideWindow', (_, id) => {
    WindowsController.hideAndBlur(id);
  });

  // Closes a window by its key.
  ipcMain.on('closeWindow', (_, id) => {
    WindowsController.close(id);
    mb?.window?.removeListener('will-move', () => {
      if (mb?.window) handleMenuBounds(mb.window);
    });
  });

  // Handles the closing of a chain.
  ipcMain.on('chain:remove', (_, chain) => {
    APIs.close(chain);
  });

  // Execute communication with a Ledger device.
  ipcMain.on('ledger:doLedgerLoop', (_, accountIndex, tasks) => {
    console.debug(accountIndex, tasks);
    // executeLedgerLoop(Windows.get('import'), 'Polkadot', tasks, {
    //   accountIndex,
    // });
  });

  // Attempt an account import.
  ipcMain.on(
    'newAddressImported',
    async (_, chain: ChainID, source, address, name) => {
      orchestrator.next({
        task: 'newAddressImported',
        data: { chain, source, address, name },
      });
    }
  );

  // Attempt an account removal.
  ipcMain.on('removeImportedAccount', (_, chain, address) => {
    orchestrator.next({
      task: 'removeImportedAccount',
      data: { chain, address },
    });
  });

  // Broadcast to all active windows that an address has been updated.
  ipcMain.on('app:requestImportedAccounts', () => {
    reportAllWindows(reportImportedAccounts);
  });

  // Initiate a transaction.
  ipcMain.on('requestInitTx', (_, chain, from, nonce, pallet, method, args) => {
    Extrinsic.new(chain, from, nonce, pallet, method, args);
  });

  // Reset transaction.
  ipcMain.on('requestResetTx', () => {
    Extrinsic.reset();
  });

  // Submit Vault transaction
  ipcMain.on('reportSignedVaultTx', (_, signature) => {
    Extrinsic.setSignature(signature);
    Extrinsic.submit();
  });

  //Request dismiss event
  ipcMain.on('requestDismissEvent', (_, eventData: DismissEvent) => {
    reportDismissEvent(eventData);
  });

  // Open a browser window.
  ipcMain.on('openBrowserURL', (_, url) => {
    shell.openExternal(url);
  });
});
