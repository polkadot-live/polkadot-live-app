// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IpcRendererEvent } from 'electron';
import type { ChainID } from './chains';
import type { AnyJson } from './misc';
import type { LedgerTask } from './ledger';
import type { AccountSource, FlattenedAccountData } from './accounts';
import type { DismissEvent, EventCallback } from './reporter';
import type { TxStatus } from './tx';
import type { FlattenedAPIData } from './apis';
import type { SubscriptionTask } from './subscriptions';

export interface PreloadAPI {
  initializeApp: ApiInitializeApp;
  initializeAppOnline: ApiInitializeAppOnline;
  initializeAppOffline: ApiInitializeAppOffline;

  getOnlineStatus: ApiGetOnlineStatus;
  getPersistedAccounts: ApiGetPersistedAccounts;
  getPersistedAccountTasks: ApiGetPersistedAccountTasks;
  setPersistedAccounts: ApiSetPersistedAccounts;
  persistEvent: ApiPersistEvent;
  getChainSubscriptions: ApiGetChainSubscriptions;
  updatePersistedChainTask: ApiUpdatePersistedChainTask;
  updatePersistedAccountTask: ApiUpdatePersistedAccountTask;

  quitApp: ApiEmptyPromiseRequest;
  hideWindow: ApiHideWindow;
  closeWindow: ApiCloseWindow;
  chainRemoved: ApiChainRemoved;
  chainConnected: ApiSyncChain;
  chainDisconnected: ApiSyncChain;
  removeChain: ApiRemoveChain;

  openWindow: ApiOpenWindow;

  doLedgerLoop: ApiDoLedgerLoop;
  reportLedgerStatus: ApiReportLedgerStatus;

  requestImportedAccounts: ApiEmptyRequest;
  newAddressImported: ApiNewAddressImported;
  removeImportedAccount: ApiRemoveImportedAccount;
  reportImportedAccounts: ApiReportImportedAccounts;
  //reportAccountState: ApiReportAccountState;

  reportNewEvent: ApiReportNewEvent;
  reportDismissEvent: ApiReportDismissEvent;
  removeEventFromStore: ApiRemoveEventFromStore;

  requestInitTx: ApiRequestInitTx;
  requestResetTx: ApiEmptyRequest;
  requestDismissEvent: ApiRequestDismissEvent;
  reportSignedVaultTx: ApRreportSignedVaultTx;
  reportTx: APIReportTx;
  reportTxStatus: ApiReportTxStatus;

  handleConnectionStatus: ApiHandleConnectionStatus;
  reportOnlineStatus: ApiReportOnlineStatus;

  openBrowserURL: ApiOpenBrowserWindow;
}

// Types of MyAPI methods.

type ApiEmptyRequest = () => void;
type ApiEmptyPromiseRequest = () => Promise<void>;
type ApiHideWindow = (id: string) => void;
type ApiCloseWindow = (id: string) => void;

type ApiSyncChain = (
  callback: (_: IpcRendererEvent, name: FlattenedAPIData) => void
) => Electron.IpcRenderer;

type ApiChainRemoved = (
  callback: (_: IpcRendererEvent, name: ChainID) => void
) => Electron.IpcRenderer;

type ApiRemoveChain = (chain: ChainID) => void;
type ApiOpenWindow = (id: string, args?: AnyJson) => Promise<void>;

type ApiDoLedgerLoop = (accountIndex: number, tasks: LedgerTask[]) => void;

type ApiReportLedgerStatus = (
  callback: (_: IpcRendererEvent, result: string) => void
) => Electron.IpcRenderer;

export type ApiNewAddressImported = (
  chain: ChainID,
  source: AccountSource,
  address: string,
  name: string
) => void;

type ApiRemoveImportedAccount = (chain: ChainID, account: string) => void;

type ApiReportImportedAccounts = (
  callback: (_: IpcRendererEvent, accounts: string) => void
) => Electron.IpcRenderer;

//type ApiReportAccountState = (
//  callback: (
//    _: IpcRendererEvent,
//    chain: ChainID,
//    address: string,
//    key: string,
//    value: string
//  ) => void
//) => Electron.IpcRenderer;

type ApiReportNewEvent = (
  callback: (_: IpcRendererEvent, eventData: EventCallback) => void
) => Electron.IpcRenderer;

type ApiReportDismissEvent = (
  callback: (_: IpcRendererEvent, eventData: DismissEvent) => void
) => Electron.IpcRenderer;

type ApiRemoveEventFromStore = (data: EventCallback) => Promise<boolean>;

type ApiRequestInitTx = (
  chain: ChainID,
  from: string,
  nonce: number,
  pallet: string,
  method: string,
  args: AnyJson[]
) => void;

type ApiRequestDismissEvent = (eventData: DismissEvent) => void;

type ApiHandleConnectionStatus = () => void;

type ApiReportOnlineStatus = (
  callback: (_: IpcRendererEvent, status: boolean) => void
) => Electron.IpcRenderer;

type ApiOpenBrowserWindow = (url: string) => void;

type APIReportTx = (
  callback: (_: IpcRendererEvent, txData: APIReportTxData) => void
) => Electron.IpcRenderer;

type ApiReportTxStatus = (
  callback: (_: IpcRendererEvent, status: TxStatus) => void
) => Electron.IpcRenderer;

interface APIReportTxData {
  estimatedFee: AnyJson;
  txId: AnyJson;
  payload: AnyJson;
  setGenesisHash: AnyJson;
}

type ApRreportSignedVaultTx = (signature: AnyJson) => void;

/**
 * New types
 */

type ApiInitializeApp = (callback: (_: IpcRendererEvent) => void) => void;

type ApiInitializeAppOnline = (callback: (_: IpcRendererEvent) => void) => void;

type ApiInitializeAppOffline = (
  callback: (_: IpcRendererEvent) => void
) => void;

type ApiGetOnlineStatus = () => Promise<boolean>;

type ApiGetPersistedAccounts = () => Promise<string>;

type ApiGetPersistedAccountTasks = (
  account: FlattenedAccountData
) => Promise<string>;

type ApiSetPersistedAccounts = (accounts: string) => void;

type ApiPersistEvent = (event: EventCallback) => void;

type ApiGetChainSubscriptions = () => Promise<string>;

type ApiUpdatePersistedChainTask = (task: SubscriptionTask) => Promise<void>;

type ApiUpdatePersistedAccountTask = (
  task: SubscriptionTask,
  account: FlattenedAccountData
) => Promise<void>;
