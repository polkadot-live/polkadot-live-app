// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IpcRendererEvent } from 'electron';
import type { ChainID } from './chains';
import type { AnyJson } from './misc';
import type { LedgerTask } from './ledger';
import type { AccountSource, FlattenedAccountData } from './accounts';
import type { DismissEvent, EventCallback, NotificationData } from './reporter';
import type { SubscriptionTask } from './subscriptions';
import type {
  PersistedSettings,
  SettingAction,
} from '@/renderer/screens/Settings/types';

export interface PreloadAPI {
  getPersistedIntervalTasks: () => Promise<string>;
  clearPersistedIntervalTasks: () => Promise<string>;

  persistIntervalTask: ApiPersistIntervalTask;
  removeIntervalTask: ApiRemoveIntervalTask;
  updateIntervalTask: ApiUpdateIntervalTask;

  getWindowId: () => string;

  exportAppData: ApiExportAppData;
  importAppData: ApiImportAppData;

  toggleSetting: (action: SettingAction) => void;
  getAppSettings: ApiGetAppSettings;
  getDockedFlag: ApiGetDockedFlag;
  setDockedFlag: ApiSetDockedFlag;
  toggleWindowWorkspaceVisibility: ApiToggleWorkspaceVisibility;

  initializeApp: ApiInitializeApp;
  initializeAppOnline: ApiInitializeAppOnline;
  initializeAppOffline: ApiInitializeAppOffline;

  getOnlineStatus: ApiGetOnlineStatus;
  getPersistedAccounts: ApiGetPersistedAccounts;
  getPersistedAccountTasks: ApiGetPersistedAccountTasks;
  setPersistedAccounts: ApiSetPersistedAccounts;

  persistEvent: ApiPersistEvent;
  updateAccountNameForEventsAndTasks: ApiUpdateAccountNameForEventsAndTasks;
  markEventStale: ApiMarkEventStale;
  reportStaleEvent: ApiReportStaleEvent;
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

  initOnlineStatus: ApiInitOnlineStatus;
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
type ApiExportAppData = (
  serialized: string
) => Promise<{ result: boolean; msg: string }>;

type ApiImportAppData = () => Promise<{
  result: boolean;
  msg: string;
  data?: AnyJson;
}>;

type ApiToggleWorkspaceVisibility = () => void;

type ApiGetAppSettings = () => Promise<PersistedSettings>;

type ApiGetDockedFlag = () => Promise<boolean>;

type ApiSetDockedFlag = (flag: boolean) => void;

type ApiInitializeApp = (callback: (_: IpcRendererEvent) => void) => void;

type ApiInitializeAppOnline = (
  callback: (_: IpcRendererEvent) => Promise<void>
) => void;

type ApiInitializeAppOffline = (
  callback: (_: IpcRendererEvent) => Promise<void>
) => void;

type ApiGetOnlineStatus = () => Promise<boolean>;

type ApiGetPersistedAccounts = () => Promise<string>;

type ApiGetPersistedAccountTasks = (
  account: FlattenedAccountData
) => Promise<string>;

type ApiSetPersistedAccounts = (accounts: string) => Promise<void>;

type ApiPersistEvent = (
  event: EventCallback,
  notification: NotificationData | null,
  isOneShot?: boolean
) => void;

type ApiGetChainSubscriptions = () => Promise<string>;

type ApiUpdatePersistedChainTask = (task: SubscriptionTask) => Promise<void>;

type ApiUpdatePersistedAccountTask = (
  serializedTask: string,
  serializedAccount: string
) => Promise<void>;

type ApiShowNotification = (content: NotificationData) => void;

type ApiUpdateAccountNameForEventsAndTasks = (
  address: string,
  newName: string
) => Promise<EventCallback[]>;

type ApiMarkEventStale = (uid: string, chainId: ChainID) => void;

type ApiReportStaleEvent = (
  callback: (_: IpcRendererEvent, uid: string, chainId: ChainID) => void
) => Electron.IpcRenderer;

type ApiInitOnlineStatus = () => Promise<void>;

type ApiPersistIntervalTask = (serialized: string) => Promise<void>;
type ApiRemoveIntervalTask = (serialized: string) => Promise<void>;
type ApiUpdateIntervalTask = (serialized: string) => Promise<void>;
