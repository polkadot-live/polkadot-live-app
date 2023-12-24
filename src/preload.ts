// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { PreloadAPI } from '@/types/preload';
import type { DismissEvent } from '@/types/reporter';
import type { WrappedSubscriptionTasks } from './types/subscriptions';

// Expose Electron API to wdio tests
const isTest = process.env.NODE_ENV === 'test';
if (isTest) {
  require('wdio-electron-service/preload');
}

contextBridge.exposeInMainWorld('myAPI', {
  // Window lifecycle
  // ----------------

  quitApp: (): void => {
    ipcRenderer.invoke('app:quit');
  },

  hideWindow: (id) => ipcRenderer.send('app:window:hide', id),

  closeWindow: (id: string) => ipcRenderer.send('app:window:close', id),

  // Chain management
  // ----------------

  syncChain: (callback) => ipcRenderer.on('renderer:chain:sync', callback),

  chainAdded: (callback) => ipcRenderer.on('renderer:chain:added', callback),

  chainRemoved: (callback) =>
    ipcRenderer.on('renderer:chain:removed', callback),

  chainConnected: (callback) =>
    ipcRenderer.on('renderer:chain:connected', callback),

  chainDisconnected: (callback) =>
    ipcRenderer.on('renderer:chain:disconnected', callback),

  // NOTE: Not being called in any renderers (main doesn't receive app:chain:remove)
  removeChain: (chain) => ipcRenderer.send('app:chain:remove', chain),

  // Opens a window.
  openWindow: (id, args) => ipcRenderer.invoke(`${id}:open`, args),

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
  removeImportedAccount: (chain, account) =>
    ipcRenderer.send('app:account:remove', chain, account),

  // Syncs imported accounts with all open windows.
  reportImportedAccounts: (callback) =>
    ipcRenderer.on('renderer:broadcast:accounts', callback),

  // Syncs account state with all open windows.
  reportAccountState: (callback) =>
    ipcRenderer.on('renderer:account:state', callback),

  // Reports a new event to all open windows.
  reportNewEvent: (callback) => ipcRenderer.on('renderer:event:new', callback),

  // Reports a dismiss event.
  reportDismissEvent: (callback) =>
    ipcRenderer.on('renderer:event:dismiss', callback),

  // Subscription communication
  // --------------------------

  // Report chain subscriptions to renderer.
  reportChainSubscriptionState: (callback) =>
    ipcRenderer.on('renderer:broadcast:subscriptions:chains', callback),

  // Report account subscriptions to renderer.
  reportAccountSubscriptionsState: (callback) =>
    ipcRenderer.on('renderer:broadcast:subscriptions:accounts', callback),

  // Handle subscription task.
  invokeSubscriptionTask: (data: WrappedSubscriptionTasks) =>
    ipcRenderer.invoke('app:subscriptions:task:handle', data),

  // Transactions
  // ------------

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

  // Miscellaneous
  // -------------

  // Request to open a URL in the browser.
  openBrowserURL: (url) => ipcRenderer.send('app:url:open', url),
} as PreloadAPI);
