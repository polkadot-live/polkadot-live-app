// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IpcRendererEvent } from 'electron';
import type { ChainID } from './chains';
import type { AnyJson } from './misc';
import type { LedgerTask } from './ledger';
import type { AccountSource, FlattenedAccountData } from './accounts';
import type { DismissEvent, EventCallback } from './reporter';
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
  updateAccountNameForEventsAndTasks: ApiUpdateAccountNameForEventsAndTasks;
  getChainSubscriptions: ApiGetChainSubscriptions;
  updatePersistedChainTask: ApiUpdatePersistedChainTask;
  updatePersistedAccountTask: ApiUpdatePersistedAccountTask;
  showNotification: ApiShowNotification;

  quitApp: ApiEmptyPromiseRequest;
  hideWindow: ApiHideWindow;
  closeWindow: ApiCloseWindow;
  openWindow: ApiOpenWindow;

  doLedgerLoop: ApiDoLedgerLoop;
  reportLedgerStatus: ApiReportLedgerStatus;

  requestImportedAccounts: ApiEmptyRequest;
  newAddressImported: ApiNewAddressImported;
  removeImportedAccount: ApiRemoveImportedAccount;

  reportNewEvent: ApiReportNewEvent;
  reportDismissEvent: ApiReportDismissEvent;
  removeEventFromStore: ApiRemoveEventFromStore;

  requestDismissEvent: ApiRequestDismissEvent;

  handleConnectionStatus: ApiHandleConnectionStatus;
  reportOnlineStatus: ApiReportOnlineStatus;

  openBrowserURL: ApiOpenBrowserWindow;
}

// Types of MyAPI methods.

type ApiEmptyRequest = () => void;
type ApiEmptyPromiseRequest = () => Promise<void>;
type ApiHideWindow = (id: string) => void;
type ApiCloseWindow = (id: string) => void;
type ApiOpenWindow = (id: string, args?: AnyJson) => void;

type ApiDoLedgerLoop = (
  accountIndex: number,
  appName: string,
  tasks: LedgerTask[]
) => void;

type ApiReportLedgerStatus = (
  callback: (_: IpcRendererEvent, result: string) => void
) => Electron.IpcRenderer;

export type ApiNewAddressImported = (
  chain: ChainID,
  source: AccountSource,
  address: string,
  name: string
) => void;

type ApiRemoveImportedAccount = (account: string) => void;

type ApiReportNewEvent = (
  callback: (_: IpcRendererEvent, eventData: EventCallback) => void
) => Electron.IpcRenderer;

type ApiReportDismissEvent = (
  callback: (_: IpcRendererEvent, eventData: DismissEvent) => void
) => Electron.IpcRenderer;

type ApiRemoveEventFromStore = (data: EventCallback) => Promise<boolean>;

type ApiRequestDismissEvent = (eventData: DismissEvent) => void;

type ApiHandleConnectionStatus = () => void;

type ApiReportOnlineStatus = (
  callback: (_: IpcRendererEvent, status: boolean) => void
) => Electron.IpcRenderer;

type ApiOpenBrowserWindow = (url: string) => void;

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

type ApiShowNotification = (content: { title: string; body: string }) => void;

type ApiUpdateAccountNameForEventsAndTasks = (
  address: string,
  newName: string
) => Promise<EventCallback[]>;
