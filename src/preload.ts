// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { DismissEvent } from '@polkadot-live/types';
import { contextBridge, ipcRenderer } from 'electron';
import { PreloadAPI } from '@polkadot-live/types/preload';

// Expose Electron API to wdio tests
if (process.env.NODE_ENV === 'test') {
  require('wdio-electron-service/preload');
}

contextBridge.exposeInMainWorld('myAPI', {
  // Window lifecycle

  quitApp: (): void => {
    ipcRenderer.invoke('app:quit');
  },
  hideWindow: (id) => {
    return ipcRenderer.send('window:hide', id);
  },
  closeWindow: (id: string) => {
    return ipcRenderer.send('window:close', id);
  },

  // Chain management

  syncChain: (callback) => {
    return ipcRenderer.on('chain:sync', callback);
  },
  chainAdded: (callback) => {
    return ipcRenderer.on('chain:added', callback);
  },
  chainRemoved: (callback) => {
    return ipcRenderer.on('chain:removed', callback);
  },
  // NOTE: Not being called (chain:connected not sent from main)
  chainConnected: (callback) => {
    return ipcRenderer.on('chain:connected', callback);
  },
  // NOTE: Not being called (chain:disconnected not sent from main)
  chainDisconnected: (callback) => {
    return ipcRenderer.on('chain:disconnected', callback);
  },
  // NOTE: Not being called in any renderers (main doesn't receive chain:do-remove)
  removeChain: (chain) => {
    return ipcRenderer.send('chain:do-remove', chain);
  },

  // Opens a window.
  openWindow: (id, args) => {
    return ipcRenderer.invoke(`${id}:open`, args);
  },

  // Performs a Ledger loop.
  doLedgerLoop: (accountIndex, tasks) => {
    return ipcRenderer.send('ledger:doLedgerLoop', accountIndex, tasks);
  },

  // Reports a Ledger device result to all open windows.
  reportLedgerStatus: (callback) => {
    return ipcRenderer.on('reportLedgerStatus', callback);
  },

  // Requests to main process to report imported accounts.
  requestImportedAccounts: () => {
    return ipcRenderer.send('app:requestImportedAccounts');
  },

  // Attempts to import a new account.
  newAddressImported: (chain, source, address, name) => {
    ipcRenderer.send('newAddressImported', chain, source, address, name);
  },

  // Attempts to remove an imported account.
  removeImportedAccount: (chain, account) => {
    return ipcRenderer.send('removeImportedAccount', chain, account);
  },

  // Syncs imported accounts with all open windows.
  reportImportedAccounts: (callback) => {
    return ipcRenderer.on('reportImportedAccounts', callback);
  },

  // Syncs account state with all open windows.
  reportAccountState: (callback) => {
    return ipcRenderer.on('reportAccountState', callback);
  },

  // Reports a new event to all open windows.
  reportNewEvent: (callback) => {
    return ipcRenderer.on('reportNewEvent', callback);
  },

  // Reports a dismiss event.
  reportDismissEvent: (callback) => {
    return ipcRenderer.on('reportDismissEvent', callback);
  },

  // Transactions

  // Requests to main process to initiate a transaction.
  requestInitTx: (chain, from, nonce, pallet, method, args) => {
    return ipcRenderer.send(
      'requestInitTx',
      chain,
      from,
      nonce,
      pallet,
      method,
      args
    );
  },

  // Resets all tx data.
  requestResetTx: () => {
    return ipcRenderer.send('requestResetTx');
  },

  // Reports a dismissed event to the main process.
  requestDismissEvent: (eventData: DismissEvent) => {
    return ipcRenderer.send('requestDismissEvent', eventData);
  },

  // Report a transaction to a window.
  reportTx: (callback) => {
    return ipcRenderer.on('reportTx', callback);
  },

  // Report a transaction status to a window.
  reportTxStatus: (callback) => {
    return ipcRenderer.on('reportTxStatus', callback);
  },

  // Requests a transaction signed by Polkadot Vault.
  reportSignedVaultTx: (signature) => {
    return ipcRenderer.send('reportSignedVaultTx', signature);
  },

  // Miscellaneous

  // Request to open a URL in the browser.
  openBrowserURL: (url) => {
    return ipcRenderer.send('openBrowserURL', url);
  },
} as PreloadAPI);
