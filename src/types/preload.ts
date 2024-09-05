// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from './accounts';
import type { AnyJson } from './misc';
import type { ChainID } from './chains';
import type { DismissEvent, EventCallback, NotificationData } from './reporter';
import type { LedgerTask } from './ledger';
import type { IpcTask } from './communication';
import type { IpcRendererEvent } from 'electron';
import type {
  PersistedSettings,
  SettingAction,
} from '@/renderer/screens/Settings/types';
import type { WorkspaceItem } from './developerConsole/workspaces';
import type { ExportResult, ImportResult } from './backup';

export interface PreloadAPI {
  rawAccountTask: (task: IpcTask) => Promise<string | void>;
  sendIntervalTask: (task: IpcTask) => Promise<string | void>;
  sendSubscriptionTask: (task: IpcTask) => Promise<string | void>;
  sendEventTaskAsync: (task: IpcTask) => Promise<string | void>;
  sendEventTask: (task: IpcTask) => void;

  getOsPlatform: () => Promise<string>;

  fetchPersistedWorkspaces: () => Promise<WorkspaceItem[]>;
  deleteWorkspace: (serialised: string) => void;
  launchWorkspace: (serialised: string) => void;

  startWebsocketServer: () => Promise<boolean>;
  stopWebsocketServer: () => Promise<boolean>;
  reportWorkspace: (
    callback: (_: IpcRendererEvent, serialised: string) => void
  ) => Electron.IpcRenderer;

  getWindowId: () => string;

  exportAppData: () => Promise<ExportResult>;
  importAppData: () => Promise<ImportResult>;

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
  setPersistedAccounts: ApiSetPersistedAccounts;

  updateAccountNameForEventsAndTasks: ApiUpdateAccountNameForEventsAndTasks;
  markEventStale: ApiMarkEventStale;
  reportStaleEvent: ApiReportStaleEvent;
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
  chainName: string,
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

type ApiSetPersistedAccounts = (accounts: string) => Promise<void>;

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
