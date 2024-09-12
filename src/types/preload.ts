// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from './misc';
import type { ChainID } from './chains';
import type { DismissEvent, EventCallback, NotificationData } from './reporter';
import type { ExportResult, ImportResult } from './backup';
import type { LedgerTask } from './ledger';
import type { IpcTask } from './communication';
import type { IpcRendererEvent } from 'electron';
import type { PersistedSettings } from '@/renderer/screens/Settings/types';
import type { WorkspaceItem } from './developerConsole/workspaces';

export interface PreloadAPI {
  getWindowId: () => string;
  getOsPlatform: () => Promise<string>;

  rawAccountTask: (task: IpcTask) => Promise<string | void>;
  sendIntervalTask: (task: IpcTask) => Promise<string | void>;
  sendSubscriptionTask: (task: IpcTask) => Promise<string | void>;
  sendAccountTask: (task: IpcTask) => Promise<string | void>;

  sendConnectionTask: (task: IpcTask) => void;
  sendConnectionTaskAsync: (task: IpcTask) => Promise<boolean | void>;
  reportOnlineStatus: ApiReportOnlineStatus;

  sendEventTaskAsync: (task: IpcTask) => Promise<string | boolean>;
  sendEventTask: (task: IpcTask) => void;
  reportStaleEvent: ApiReportStaleEvent;

  sendWorkspaceTask: (task: IpcTask) => void;
  fetchPersistedWorkspaces: () => Promise<WorkspaceItem[]>;

  sendWebsocketTask: (task: IpcTask) => Promise<boolean>;
  reportWorkspace: (
    callback: (_: IpcRendererEvent, serialised: string) => void
  ) => Electron.IpcRenderer;

  exportAppData: () => Promise<ExportResult>;
  importAppData: () => Promise<ImportResult>;

  sendSettingTask: (task: IpcTask) => void;
  getAppSettings: ApiGetAppSettings;

  initializeApp: ApiInitializeApp;
  initializeAppOnline: ApiInitializeAppOnline;
  initializeAppOffline: ApiInitializeAppOffline;

  showNotification: ApiShowNotification;

  quitApp: ApiEmptyPromiseRequest;
  hideWindow: ApiHideWindow;
  closeWindow: ApiCloseWindow;
  openWindow: ApiOpenWindow;

  doLedgerLoop: ApiDoLedgerLoop;
  reportLedgerStatus: ApiReportLedgerStatus;

  requestImportedAccounts: ApiEmptyRequest;

  reportNewEvent: ApiReportNewEvent;
  reportDismissEvent: ApiReportDismissEvent;
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

type ApiReportNewEvent = (
  callback: (_: IpcRendererEvent, eventData: EventCallback) => void
) => Electron.IpcRenderer;

type ApiReportDismissEvent = (
  callback: (_: IpcRendererEvent, eventData: DismissEvent) => void
) => Electron.IpcRenderer;

type ApiReportOnlineStatus = (
  callback: (_: IpcRendererEvent, status: boolean) => void
) => Electron.IpcRenderer;

type ApiOpenBrowserWindow = (url: string) => void;

/**
 * New types
 */
type ApiGetAppSettings = () => Promise<PersistedSettings>;

type ApiInitializeApp = (callback: (_: IpcRendererEvent) => void) => void;

type ApiInitializeAppOnline = (
  callback: (_: IpcRendererEvent) => Promise<void>
) => void;

type ApiInitializeAppOffline = (
  callback: (_: IpcRendererEvent) => Promise<void>
) => void;

type ApiShowNotification = (content: NotificationData) => void;

type ApiReportStaleEvent = (
  callback: (_: IpcRendererEvent, uid: string, chainId: ChainID) => void
) => Electron.IpcRenderer;
