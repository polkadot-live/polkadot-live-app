// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { PreloadAPI } from '@/types/preload';
import type { AnyJson } from './types/misc';
import type { IpcTask } from './types/communication';
import type { SettingAction } from './renderer/screens/Settings/types';

console.log(global.location.search);

// Expose Electron API to wdio tests
const isTest = process.env.NODE_ENV === 'test';
if (isTest) {
  require('wdio-electron-service/preload');
}

/**
 * Message ports
 *
 * Cannot send ports via the context bridge. Instead, post it to the renderer
 * process using `window.postMessage`. Discussed here:
 * https://github.com/electron/electron/issues/27024
 */

ipcRenderer.on('port', (e: AnyJson, msg: AnyJson) => {
  window.postMessage({ target: msg.target }, '*', [e.ports[0]]);
});

export const API: PreloadAPI = {
  /**
   * Extract window ID from browser window's location to enable dynamic rendering.
   */
  getWindowId: () => {
    const urlString = global.location.href;

    // Regular expression to match URL parameters
    const regex = /[?&]([^=#]+)=([^&#]*)/g;

    let match;
    while ((match = regex.exec(urlString)) !== null) {
      const paramName = match[1];
      const paramValue = match[2];

      if (paramName === 'windowId') {
        return paramValue;
      }
    }
    return '';
  },

  /**
   * Raw Accounts
   */
  rawAccountTask: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:raw-account', task),

  /**
   * Accounts
   */
  sendAccountTask: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:account', task),

  /**
   * Events
   */
  sendEventTask: (task: IpcTask) => ipcRenderer.send('main:task:event', task),

  sendEventTaskAsync: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:event:async', task),

  /**
   * Platform
   */
  getOsPlatform: async () => await ipcRenderer.invoke('app:platform:get'),

  /**
   * Workspaces (Developer Console)
   */
  fetchPersistedWorkspaces: async () =>
    await ipcRenderer.invoke('app:workspaces:fetch'),

  deleteWorkspace: (serialised: string) =>
    ipcRenderer.send('app:workspace:delete', serialised),

  launchWorkspace: (serialised: string) =>
    ipcRenderer.send('app:workspace:launch', serialised),

  /**
   * Websocket Server
   */

  startWebsocketServer: async () =>
    await ipcRenderer.invoke('app:websockets:start'),

  stopWebsocketServer: async () =>
    await ipcRenderer.invoke('app:websockets:stop'),

  reportWorkspace: (callback) =>
    ipcRenderer.on('settings:workspace:receive', callback),

  /**
   * Account subscriptions
   */
  sendSubscriptionTask: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:subscription', task),

  /**
   * Interval subscriptions
   */

  sendIntervalTask: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:interval', task),

  /**
   * File import and export
   */

  exportAppData: async () => await ipcRenderer.invoke('app:data:export'),

  importAppData: async () => await ipcRenderer.invoke('app:data:import'),

  /**
   * New handlers
   */

  toggleSetting: (action: SettingAction) =>
    ipcRenderer.send('app:setting:toggle', action),

  toggleWindowWorkspaceVisibility: () =>
    ipcRenderer.send('app:set:workspaceVisibility'),

  getAppSettings: async () => await ipcRenderer.invoke('app:settings:get'),

  getDockedFlag: async () => await ipcRenderer.invoke('app:docked:get'),

  setDockedFlag: (flag: boolean) => ipcRenderer.send('app:docked:set', flag),

  initializeApp: (callback) =>
    ipcRenderer.on('renderer:app:initialize', callback),

  initializeAppOnline: (callback) =>
    ipcRenderer.on('renderer:app:initialize:online', callback),

  initializeAppOffline: (callback) =>
    ipcRenderer.on('renderer:app:initialize:offline', callback),

  // Get online status from main.
  getOnlineStatus: async () => await ipcRenderer.invoke('app:online:status'),

  // Get persisted accounts from state.
  getPersistedAccounts: async () =>
    await ipcRenderer.invoke('app:accounts:get'),

  // Overwrite persisted accounts in store.
  setPersistedAccounts: (accounts: string) =>
    ipcRenderer.invoke('app:accounts:set', accounts),

  reportStaleEvent: (callback) =>
    ipcRenderer.on('renderer:event:stale', callback),

  showNotification: (content: {
    title: string;
    body: string;
    subtitle?: string;
  }) => ipcRenderer.send('app:notification:show', content),

  /**
   * Window lifecycle
   */

  quitApp: async (): Promise<void> => {
    await ipcRenderer.invoke('app:quit');
  },

  hideWindow: (id) => ipcRenderer.send('app:window:hide', id),

  closeWindow: (id: string) => ipcRenderer.send('app:window:close', id),

  /**
   * Chain management
   */

  // Report online status.
  reportOnlineStatus: (callback) =>
    ipcRenderer.on('renderer:broadcast:onlineStatus', callback),

  // Opens a window.
  openWindow: async (id, args) => ipcRenderer.send(`${id}:open`, args),

  // Performs a Ledger loop.
  doLedgerLoop: (accountIndex, chainName, tasks) =>
    ipcRenderer.send('app:ledger:do-loop', accountIndex, chainName, tasks),

  // Reports a Ledger device result to all open windows.
  reportLedgerStatus: (callback) =>
    ipcRenderer.on('renderer:ledger:report:status', callback),

  // Requests to main process to report imported accounts to all windows.
  requestImportedAccounts: () => ipcRenderer.send('app:request:accounts'),

  // Reports a new event to all open windows.
  reportNewEvent: (callback) => ipcRenderer.on('renderer:event:new', callback),

  // Reports a dismiss event.
  reportDismissEvent: (callback) =>
    ipcRenderer.on('renderer:event:dismiss', callback),

  /**
   * Online status
   */

  // Initialise the online status controller when app starts.
  initOnlineStatus: async () => await ipcRenderer.invoke('app:connection:init'),

  // Handle switching between online and offline.
  handleConnectionStatus: () => ipcRenderer.send('app:connection:status'),

  /**
   * Miscellaneous
   */

  // Request to open a URL in the browser.
  openBrowserURL: (url) => ipcRenderer.send('app:url:open', url),
};

contextBridge.exposeInMainWorld('myAPI', API);
