// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { PreloadAPI } from '@/types/preload';
import type {
  DismissEvent,
  EventCallback,
  NotificationData,
} from '@/types/reporter';
import type { FlattenedAccountData } from './types/accounts';
import type { SubscriptionTask } from './types/subscriptions';
import type { AnyJson } from './types/misc';
import type { ChainID } from './types/chains';
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
   * Interval subscriptions
   */

  getPersistedIntervalTasks: async () =>
    await ipcRenderer.invoke('app:interval:tasks:get'),

  clearPersistedIntervalTasks: async () =>
    await ipcRenderer.invoke('app:interval:tasks:clear'),

  persistIntervalTask: async (serialized: string) =>
    await ipcRenderer.invoke('app:interval:task:add', serialized),

  removeIntervalTask: async (serialized: string) =>
    await ipcRenderer.invoke('app:interval:task:remove', serialized),

  updateIntervalTask: async (serialized: string) =>
    await ipcRenderer.invoke('app:interval:task:update', serialized),

  /**
   * File import and export
   */

  exportAppData: async (serialized: string) =>
    await ipcRenderer.invoke('app:data:export', serialized),

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

  // Get persisted subscription tasks for account.
  getPersistedAccountTasks: async (account: FlattenedAccountData) =>
    await ipcRenderer.invoke('app:accounts:tasks:get', account),

  // Overwrite persisted accounts in store.
  setPersistedAccounts: (accounts: string) =>
    ipcRenderer.invoke('app:accounts:set', accounts),

  persistEvent: (
    event: EventCallback,
    notification: NotificationData | null,
    isOneShot = false
  ) => ipcRenderer.send('app:event:persist', event, notification, isOneShot),

  updateAccountNameForEventsAndTasks: async (
    address: string,
    newName: string
  ): Promise<EventCallback[]> =>
    await ipcRenderer.invoke('app:events:update:accountName', address, newName),

  markEventStale: (uid: string, chainId: ChainID) =>
    ipcRenderer.send('app:event:stale', uid, chainId),

  reportStaleEvent: (callback) =>
    ipcRenderer.on('renderer:event:stale', callback),

  getChainSubscriptions: async () =>
    await ipcRenderer.invoke('app:subscriptions:chain:get'),

  updatePersistedChainTask: async (task: SubscriptionTask) =>
    await ipcRenderer.invoke('app:subscriptions:chain:update', task),

  updatePersistedAccountTask: async (
    serializedTask: string,
    serializedAccount: string
  ) =>
    await ipcRenderer.invoke(
      'app:subscriptions:account:update',
      serializedTask,
      serializedAccount
    ),

  showNotification: (content: { title: string; body: string }) =>
    ipcRenderer.send('app:notification:show', content),

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
  doLedgerLoop: (accountIndex, appName, tasks) =>
    ipcRenderer.send('app:ledger:do-loop', accountIndex, appName, tasks),

  // Reports a Ledger device result to all open windows.
  reportLedgerStatus: (callback) =>
    ipcRenderer.on('renderer:ledger:report:status', callback),

  // Requests to main process to report imported accounts to all windows.
  requestImportedAccounts: () => ipcRenderer.send('app:request:accounts'),

  // Attempts to import a new account.
  newAddressImported: (chain, source, address, name) => {
    ipcRenderer.send('app:account:import', chain, source, address, name);
  },

  // Attempts to remove an imported account.
  removeImportedAccount: (account) =>
    ipcRenderer.send('app:account:remove', account),

  // Reports a new event to all open windows.
  reportNewEvent: (callback) => ipcRenderer.on('renderer:event:new', callback),

  // Reports a dismiss event.
  reportDismissEvent: (callback) =>
    ipcRenderer.on('renderer:event:dismiss', callback),

  // Remove event from store.
  removeEventFromStore: async (data: EventCallback) =>
    await ipcRenderer.invoke('app:event:remove', data),

  /**
   * Online status
   */

  // Initialise the online status controller when app starts.
  initOnlineStatus: async () => await ipcRenderer.invoke('app:connection:init'),

  // Handle switching between online and offline.
  handleConnectionStatus: () => ipcRenderer.send('app:connection:status'),

  /**
   * Transactions
   */

  // Reports a dismissed event to the main process.
  requestDismissEvent: (eventData: DismissEvent) =>
    ipcRenderer.send('app:event:dismiss', eventData),

  /**
   * Miscellaneous
   */

  // Request to open a URL in the browser.
  openBrowserURL: (url) => ipcRenderer.send('app:url:open', url),
};

contextBridge.exposeInMainWorld('myAPI', API);
