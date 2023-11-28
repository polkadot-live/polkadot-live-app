import 'websocket-polyfill';
import type { IpcMainInvokeEvent } from 'electron';
import { app, ipcMain, protocol, shell, systemPreferences } from 'electron';
import Store from 'electron-store';
import { WindowsController } from './controller/WindowsController';
import { APIsController } from './controller/APIsController';
import { orchestrator } from './orchestrator';
import { ExtrinsicsController } from './controller/ExtrinsicsController';
import AutoLaunch from 'auto-launch';
import { reportAllWindows, reportImportedAccounts } from './Utils';
import unhandled from 'electron-unhandled';
import type { ChainID } from '@/types/chains';
import type { DismissEvent } from '@/types/reporter';
import * as WindowUtils from '@/utils/WindowUtils';
import { AccountsController } from './controller/AccountsController';
import type { AnyData } from './types/misc';
import { Account } from './model/Account';
import { AccountType } from './types/accounts';
import type { FlattenedAccountData } from './types/accounts';

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

app.whenReady().then(() => {
  // Auto launch app on login.
  const autoLaunch = new AutoLaunch({
    name: 'Polkadot Live',
  });
  autoLaunch.isEnabled().then((isEnabled: boolean) => {
    if (!isEnabled) autoLaunch.enable();
  });

  // Ask for camera permission (Mac OS)
  if (process.platform === 'darwin' && !isTest) {
    systemPreferences
      .askForMediaAccess('camera')
      .then((result) => {
        console.log(`camera permission enabled: ${result}`);
      })
      .catch((err) => console.error(err));
  }

  // ------------------------------
  // Create windows
  // ------------------------------

  // Create menu bar and tray.
  WindowUtils.createMainWindow(isTest);
  WindowUtils.createTray();

  // Handle Ledger account import.
  WindowUtils.handleWindowOnIPC('import', isTest);

  // Handle action window.
  WindowUtils.handleWindowOnIPC('action', isTest, {
    height: 375,
    minHeight: 375,
    maxHeight: 375,
  });

  // ------------------------------
  // WDIO Custom Electron API
  // ------------------------------

  if (isTest) {
    ipcMain.handle(
      'wdio-electron',
      (_: IpcMainInvokeEvent, cmd: string, params?: AnyData) => {
        switch (cmd) {
          case 'toggleMainWindow': {
            WindowsController.toggleVisible('menu');
            break;
          }
          case 'AccountsController#add': {
            const account = AccountsController.add(
              params.chainId,
              params.source,
              params.address,
              params.name
            );

            return account ? account.flattenData() : false;
          }
          case 'AccountsController#get1': {
            AccountsController.add(
              params.chainId,
              params.source,
              params.address,
              params.name
            );

            const account = AccountsController.get(
              params.chainId,
              params.address
            );

            return account ? account.flattenData() : false;
          }
          case 'AccountsController#get2': {
            const account = AccountsController.get(
              params.chainId,
              params.address
            );

            return account ? account.flattenData() : false;
          }
          case 'AccountsController#set': {
            AccountsController.add(
              params.original.chainId,
              params.original.source,
              params.original.address,
              params.original.name
            );

            const account = AccountsController.get(
              params.original.chainId,
              params.original.address
            );

            if (!account) return false;

            account.name = params.updated.name;
            account.source = params.updated.source;

            AccountsController.set(params.original.chainId, account);

            const updated = AccountsController.get(
              params.original.chainId,
              params.original.address
            );

            return updated ? updated.flattenData() : false;
          }
          case 'AccountsController#pushAccount': {
            const chainId = params.acc1.chainId;

            // Add first account to accounts controller
            AccountsController.add(
              chainId,
              params.acc1.source,
              params.acc1.address,
              params.acc1.name
            );

            // Second account for manually passing to pushAccount
            const acc2 = new Account(
              chainId,
              AccountType.User,
              params.acc2.source,
              params.acc2.address,
              params.acc2.name
            );

            const result = AccountsController.pushAccount(chainId, acc2);
            const flattened: FlattenedAccountData[] = [];

            for (const accounts of result.values()) {
              accounts.forEach((a) => flattened.push(a.flattenData()));
            }

            return flattened;
          }
        }
      }
    );
  }

  // ------------------------------
  // IPC handlers
  // ------------------------------

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
