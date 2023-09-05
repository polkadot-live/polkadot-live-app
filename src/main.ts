import 'websocket-polyfill';
import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { Accounts } from './controller/Accounts';
import { Windows } from './controller/Windows';
import unhandled from 'electron-unhandled';
import {
  AccountType,
  AnyFunction,
  AnyJson,
  DismissEvent,
} from '@polkadot-live/types';
import { MainDebug as debug } from './debugging';
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

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Enable priviledges.
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

// Initialise Electron store.
export const store = new Store();

// App initialization process.
orchestrator.next({
  task: 'initialize',
});

// Report imported accounts to renderer.
export const reportImportedAccounts = (id: string) => {
  Windows.get(id)?.webContents?.send(
    'reportImportedAccounts',
    Accounts.getAll()
  );
};

// Report dismissed event to renderer.
const reportDismissEvent = (eventData: DismissEvent) => {
  Windows.get('menu')?.webContents?.send('reportDismissEvent', eventData);
};

const reportAccountsState = (id: string) => {
  Object.values(Accounts.accounts).forEach((chainAccounts) => {
    chainAccounts.forEach(({ chain, address, state, type }) => {
      if (type === AccountType.User) {
        Object.entries(state.getAllState()).forEach(([key, value]) => {
          debug('🏦 Reporting account state %o', key, value);
          Windows.get(id)?.webContents?.send(
            'reportAccountState',
            chain,
            address,
            key,
            value
          );
        });
      }
    });
  });
};

// // Call a function for all windows.
export const reportAllWindows = (callback: AnyFunction) => {
  for (const { id } of Windows?.active || []) {
    callback(id);
  }
};

// Report active chains to renderer.
const reportActiveInstances = (id: string) => {
  for (const { chain } of APIs.instances) {
    Windows.get(id)?.webContents?.send('syncChain', chain);
  }
};

// Initalize store items
const initializeState = (id: string) => {
  reportImportedAccounts(id);
  reportActiveInstances(id);
  reportAccountsState(id);
};

// Initialise menubar window.
const initialMenuBounds: AnyJson = store.get('menu_bounds');

const mb = menubar({
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
  },
});

// Initialise a window.
const handleOpenWindow = (name: string, options?: AnyJson) => {
  ipcMain.handle(`${name}:open`, (_, args?: AnyJson) => {
    // Ensure menu is hidden.
    mb.hideWindow();

    // Either creates a window or focuses an existing one.
    if (Windows.get(name)) {
      Windows.get(name).show();
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
      });

      // Format args into URL if present.
      args = args ? `?${new URLSearchParams(args).toString()}` : '';

      w.loadURL(
        path.join(
          __dirname,
          `../renderer/${MAIN_WINDOW_VITE_NAME}/#/${name}${args}`
        )
      );
      w.show();

      Windows.add(w, name);

      registerLocalShortcut(w, 'CmdOrCtrl+Q', () => Windows.close(name));
      registerLocalShortcut(w, 'CmdOrCtrl+W', () => Windows.close(name));

      // populate items from store and report.
      w.on('ready-to-show', () => {
        initializeState(name);
      });

      w.on('focus', () => {
        Windows.focus(name);
      });
      w.on('blur', () => {
        Windows.blur(name);
      });
      w.on('close', () => {
        unregisterAllLocalShortcut(w);
      });
      w.on('closed', () => {
        Windows.remove(name);
      });
    }
  });
};

// Save current menu position to store.
const handleMenuBounds = async (w: BrowserWindow) => {
  if (w.isFocused()) {
    store.set('menu_bounds', mb?.window?.getBounds());
  }
};

const moveToMenuBounds = () => {
  // Move window into position.
  const storeMenuPos: AnyJson = store.get('menu_bounds');
  if (storeMenuPos) {
    mb?.window?.setPosition(storeMenuPos.x, storeMenuPos.y, false);
  }
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
    if (mb?.window) {
      Windows.add(mb.window, 'menu');
      Windows.focus('menu');

      // Bootstrap account events for all chains.
      Discover.bootstrapEvents();

      // Populate items from store.
      initializeState('menu');

      // Listen to window movements.
      mb.window.addListener('move', () => {
        if (mb?.window) handleMenuBounds(mb.window);
      });

      mb.window.addListener('resize', () => {
        if (mb?.window) handleMenuBounds(mb.window);
      });
    }
  });

  mb.on('after-show', () => {
    // Move window to saved position.
    moveToMenuBounds();
  });

  mb.on('focus-lost', () => {
    Windows.blur('menu');
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
    Windows.hideAndBlur(id);
  });

  // Closes a window by its key.
  ipcMain.on('closeWindow', (_, id) => {
    Windows.close(id);
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
