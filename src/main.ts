import { app, BrowserWindow } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { AnyFunction } from '@polkadot-live/types';
import { Accounts } from './controller/Accounts';
import { Windows } from './controller/Windows';

// Initialise Electron store.
export const store = new Store();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Call a function for all windows.
export const reportAllWindows = (callback: AnyFunction) => {
  for (const { id } of Windows?.active || []) {
    callback(id);
  }
};

// Report imported accounts to renderer.
export const reportImportedAccounts = (id: string) => {
  Windows.get(id)?.webContents?.send(
    'reportImportedAccounts',
    Accounts.getAll()
  );
};
