// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { PreloadAPI } from '@/types/preload';
import type { DismissEvent, EventCallback } from '@/types/reporter';
import type { FlattenedAccountData } from './types/accounts';
import type { SubscriptionTask } from './types/subscriptions';
import type { AnyJson } from './types/misc';

// Expose Electron API to wdio tests
const isTest = process.env.NODE_ENV === 'test';
if (isTest) {
  require('wdio-electron-service/preload');
}

/**
 * Message port
 *
 * Cannot send ports via the context bridge. Instead, post it to the renderer
 * process using `window.postMessage`. Discussed here:
 * https://github.com/electron/electron/issues/27024
 */

ipcRenderer.on('port', (e: AnyJson, msg: AnyJson) => {
  window.postMessage({ target: msg.target }, '*', [e.ports[0]]);
  console.log('message posted..');
});

export const API: PreloadAPI = {
  /**
   * New handlers
   */

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
    ipcRenderer.send('app:accounts:set', accounts),

  persistEvent: (event: EventCallback) =>
    ipcRenderer.send('app:event:persist', event),

  getChainSubscriptions: async () =>
    await ipcRenderer.invoke('app:subscriptions:chain:get'),

  updatePersistedChainTask: async (task: SubscriptionTask) =>
    await ipcRenderer.invoke('app:subscriptions:chain:update', task),

  updatePersistedAccountTask: async (
    task: SubscriptionTask,
    account: FlattenedAccountData
  ) =>
    await ipcRenderer.invoke('app:subscriptions:account:update', task, account),

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

  chainRemoved: (callback) =>
    ipcRenderer.on('renderer:chain:removed', callback),

  // NOTE: Not being used
  chainConnected: (callback) =>
    ipcRenderer.on('renderer:chain:connected', callback),

  // NOTE: Not being used
  chainDisconnected: (callback) =>
    ipcRenderer.on('renderer:chain:disconnected', callback),

  // NOTE: Not being called in any renderers (main doesn't receive app:chain:remove)
  removeChain: (chain) => ipcRenderer.send('app:chain:remove', chain),

  // Opens a window.
  openWindow: async (id, args) => await ipcRenderer.invoke(`${id}:open`, args),

  // Performs a Ledger loop.
  doLedgerLoop: (accountIndex, tasks) =>
    ipcRenderer.send('app:ledger:do-loop', accountIndex, tasks),

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

  // Syncs imported accounts with all open windows.
  reportImportedAccounts: (callback) =>
    ipcRenderer.on('renderer:broadcast:accounts', callback),

  // Syncs account state with all open windows.
  //reportAccountState: (callback) =>
  //  ipcRenderer.on('renderer:account:state', callback),

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

  // Handle switching between online and offline.
  handleConnectionStatus: () => ipcRenderer.send('app:connection:status'),

  /**
   * Transactions
   */

  // Requests to main process to initiate a transaction.
  requestInitTx: (chain, from, nonce, pallet, method, args) =>
    ipcRenderer.send('app:tx:init', chain, from, nonce, pallet, method, args),

  // Resets all tx data.
  requestResetTx: () => ipcRenderer.send('app:tx:reset'),

  // Reports a dismissed event to the main process.
  requestDismissEvent: (eventData: DismissEvent) =>
    ipcRenderer.send('app:event:dismiss', eventData),

  // Report a transaction to a window.
  reportTx: (callback) => ipcRenderer.on('renderer:tx:report:data', callback),

  // Report a transaction status to a window.
  reportTxStatus: (callback) =>
    ipcRenderer.on('renderer:tx:report:status', callback),

  // Requests a transaction signed by Polkadot Vault.
  reportSignedVaultTx: (signature) =>
    ipcRenderer.send('app:tx:vault:submit', signature),

  /**
   * Miscellaneous
   */

  // Request to open a URL in the browser.
  openBrowserURL: (url) => ipcRenderer.send('app:url:open', url),
};

contextBridge.exposeInMainWorld('myAPI', API);
