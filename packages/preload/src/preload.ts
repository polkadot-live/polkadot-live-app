// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { IpcTask, SyncID } from '@polkadot-live/types/communication';
import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { PreloadAPI } from '@polkadot-live/types/preload';
import type { SettingKey } from '@polkadot-live/types/settings';

if (!process.env.VITEST) {
  console.log(global.location.search);
}

export const KEY_CONFIG = { apiKey: 'myAPI' };

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

    let match = regex.exec(urlString);
    while (match !== null) {
      const paramName = match[1];
      const paramValue = match[2];

      if (paramName === 'windowId') {
        return paramValue;
      }
      match = regex.exec(urlString);
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
   * Extrinsics
   */

  sendExtrinsicsTaskAsync: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:extrinsics:async', task),

  /**
   * Online status
   */

  sendConnectionTaskAsync: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:connection:async', task),

  /**
   * Platform
   */

  grantCamera: async () => await ipcRenderer.invoke('app:grantCamera'),

  getOsPlatform: async () => await ipcRenderer.invoke('app:platform:get'),

  getShowDisclaimer: async () =>
    await ipcRenderer.invoke('main:disclaimer:show'),

  copyToClipboard: async (text: string) =>
    await ipcRenderer.invoke('main:clipboard:copy', text),

  /**
   * Subscriptions
   */

  sendSubscriptionTask: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:subscription', task),

  sendIntervalTask: async (task: IpcTask) =>
    await ipcRenderer.invoke('main:task:interval', task),

  sendChainEventTask: async (task: IpcTask) =>
    ipcRenderer.invoke('main:task:chainEvents', task),

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

  getAppSettings: async () => {
    const ser = await ipcRenderer.invoke('app:settings:get');
    const array: [SettingKey, boolean][] = JSON.parse(ser);
    return new Map<SettingKey, boolean>(array);
  },

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

  resizeBaseWindow: (size: 'small' | 'medium' | 'large' | '') =>
    ipcRenderer.send('app:base:resize', size),

  onBaseWindowResized: (callback) =>
    ipcRenderer.on('renderer:base:resized', callback),

  quitApp: async (): Promise<void> => {
    await ipcRenderer.invoke('app:quit');
  },

  closeWindow: (id: string) => ipcRenderer.send('app:window:close', id),
  hideWindow: (id) => ipcRenderer.send('app:window:hide', id),
  openWindow: async (id) => ipcRenderer.send(`${id}:open`),

  minimizeWindow: (windowId: string) =>
    ipcRenderer.send('app:window:minimize', windowId),

  openDevTools: (windowId: string) =>
    ipcRenderer.send('app:view:devTools', windowId),

  // Currently unused.
  restoreWindow: (windowId: string) =>
    ipcRenderer.send('app:window:restore', windowId),

  handleOpenTab: (callback) => ipcRenderer.on('renderer:tab:open', callback),

  /**
   * Shared state
   */

  // Get cached shared state from main process.
  getSharedState: async (stateId: SyncID): Promise<string | boolean> =>
    await ipcRenderer.invoke('app:sharedState:get', stateId),

  // Broadcast shared state to all renderers.
  relaySharedState: (stateId: SyncID, state: string | boolean) =>
    ipcRenderer.send('app:sharedState:relay', stateId, state),

  // Called in each renderer to listen for syncing messages.
  syncSharedState: (callback) =>
    ipcRenderer.on('renderer:sharedState:set', callback),

  /**
   * Chain management
   */

  // Performs a Ledger task.
  doLedgerTask: async (task, serData) =>
    await ipcRenderer.invoke('app:ledger:task', task, serData),

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

contextBridge.exposeInMainWorld(KEY_CONFIG.apiKey, API);
