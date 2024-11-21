// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { PreloadAPI } from '@polkadot-live/types/preload';
import type { IpcTask } from '@polkadot-live/types/communication';

if (!process.env.VITEST) {
  console.log(global.location.search);
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

  reportStaleEvent: (callback) =>
    ipcRenderer.on('renderer:event:stale', callback),

  // Reports a new event to all open windows.
  reportNewEvent: (callback) => ipcRenderer.on('renderer:event:new', callback),

  // Reports a dismiss event.
  reportDismissEvent: (callback) =>
    ipcRenderer.on('renderer:event:dismiss', callback),

  /**
   * Online status
   */

  sendConnectionTask: (task: IpcTask) =>
    ipcRenderer.send('main:task:connection', task),

  sendConnectionTaskAsync: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:connection:async', task),

  reportOnlineStatus: (callback) =>
    // Report online status from main to renderer.
    ipcRenderer.on('renderer:broadcast:onlineStatus', callback),

  /**
   * Platform
   */

  getOsPlatform: async () => await ipcRenderer.invoke('app:platform:get'),

  /**
   * Workspaces (Developer Console)
   */

  sendWorkspaceTask: (task: IpcTask) =>
    ipcRenderer.send('main:task:workspace', task),

  fetchPersistedWorkspaces: async () =>
    await ipcRenderer.invoke('app:workspaces:fetch'),

  reportWorkspace: (callback) =>
    ipcRenderer.on('settings:workspace:receive', callback),

  /**
   * Websocket Server
   */

  sendWebsocketTask: async (task: IpcTask) =>
    ipcRenderer.invoke('main:task:websockets', task),

  /**
   * Subscriptions
   */

  sendSubscriptionTask: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:subscription', task),

  sendIntervalTask: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:interval', task),

  /**
   * File import and export
   */

  exportAppData: async () => await ipcRenderer.invoke('app:data:export'),

  importAppData: async () => await ipcRenderer.invoke('app:data:import'),

  /**
   * Settings
   */

  sendSettingTask: (task: IpcTask) =>
    ipcRenderer.send('main:task:settings', task),

  getAppSettings: async () => await ipcRenderer.invoke('app:settings:get'),

  /**
   * Initialization
   */

  initializeApp: (callback) =>
    ipcRenderer.on('renderer:app:initialize', callback),

  initializeAppOnline: (callback) =>
    ipcRenderer.on('renderer:app:initialize:online', callback),

  initializeAppOffline: (callback) =>
    ipcRenderer.on('renderer:app:initialize:offline', callback),

  /**
   * Window lifecycle
   */

  quitApp: async (): Promise<void> => {
    await ipcRenderer.invoke('app:quit');
  },

  hideWindow: (id) => ipcRenderer.send('app:window:hide', id),

  closeWindow: (id: string) => ipcRenderer.send('app:window:close', id),

  openWindow: async (id) => ipcRenderer.send(`${id}:open`),

  openDevTools: (windowId: string) =>
    ipcRenderer.send('app:view:devTools', windowId),

  restoreWindow: (windowId: string) =>
    ipcRenderer.send('app:window:restore', windowId),

  handleOpenTab: (callback) => ipcRenderer.on('renderer:tab:open', callback),
  showTab: (viewId: string) => ipcRenderer.send('app:view:show', viewId),
  closeTab: (destroyViewId: string, showViewId: string | null) =>
    ipcRenderer.send('app:view:close', destroyViewId, showViewId),
  isViewOpen: (viewId) => ipcRenderer.invoke('app:view:isOpen', viewId),

  // Returns a mode flag cached in the main process to the requesting renderer.
  getModeFlag: async (modeId: string): Promise<boolean> =>
    await ipcRenderer.invoke('app:modeFlag:get', modeId),
  // Called when a mode flag changes in any renderer to broadcast it to every renderer.
  relayModeFlag: (modeId: string, flag: boolean) =>
    ipcRenderer.send('app:modeFlag:relay', modeId, flag),
  // Callback provided in useModeFlagsSyncing hook to sync state between renderers.
  syncModeFlags: (callback) =>
    ipcRenderer.on('renderer:modeFlag:set', callback),

  /**
   * Chain management
   */

  // Performs a Ledger loop.
  doLedgerLoop: (accountIndex, chainName, tasks) =>
    ipcRenderer.send('app:ledger:do-loop', accountIndex, chainName, tasks),

  // Reports a Ledger device result to all open windows.
  reportLedgerStatus: (callback) =>
    ipcRenderer.on('renderer:ledger:report:status', callback),

  // Requests to main process to report imported accounts to all windows.
  requestImportedAccounts: () => ipcRenderer.send('app:request:accounts'),

  /**
   * Miscellaneous
   */

  showNotification: (content: {
    title: string;
    body: string;
    subtitle?: string;
  }) => ipcRenderer.send('app:notification:show', content),

  // Request to open a URL in the browser.
  openBrowserURL: (url) => ipcRenderer.send('app:url:open', url),

  initAnalytics: (agent: string, windowId: string, lang: string) =>
    ipcRenderer.send('app:analytics:init', agent, windowId, lang),

  umamiEvent: (event: string, data: AnyData) =>
    ipcRenderer.send('app:umami:event', event, data),
};

contextBridge.exposeInMainWorld('myAPI', API);
