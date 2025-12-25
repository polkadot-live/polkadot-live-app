// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from './chains';
import type { DismissEvent, EventCallback, NotificationData } from './reporter';
import type { ExportResult, ImportResult } from './backup';
import type { IpcTask, SyncID, TabData } from './communication';
import type { IpcRendererEvent } from 'electron';
import type { AnyData } from './misc';
import type { SettingKey } from './settings';
import type { LedgerTask, SerLedgerTaskResponse } from './ledger';

export interface PreloadAPI {
  getWindowId: () => string;
  grantCamera: () => Promise<boolean>;
  getOsPlatform: () => Promise<string>;
  getShowDisclaimer: () => Promise<boolean>;
  copyToClipboard: (text: string) => Promise<void>;

  rawAccountTask: (task: IpcTask) => Promise<string | void>;
  sendIntervalTask: (task: IpcTask) => Promise<string | void>;
  sendSubscriptionTask: (task: IpcTask) => Promise<string | void>;
  sendChainEventTask: (task: IpcTask) => Promise<string | void>;
  sendAccountTask: (task: IpcTask) => Promise<string | void>;

  sendConnectionTaskAsync: (task: IpcTask) => Promise<boolean | void>;

  sendEventTaskAsync: (task: IpcTask) => Promise<string | boolean>;
  sendEventTask: (task: IpcTask) => void;
  reportStaleEvent: ApiReportStaleEvent;

  sendExtrinsicsTaskAsync: (task: IpcTask) => Promise<string | void>;

  exportAppData: () => Promise<ExportResult>;
  importAppData: () => Promise<ImportResult>;

  sendSettingTask: (task: IpcTask) => void;
  getAppSettings: () => Promise<Map<SettingKey, boolean>>;

  initializeApp: ApiInitializeApp;
  initializeAppOnline: ApiInitializeAppOnline;
  initializeAppOffline: ApiInitializeAppOffline;

  showNotification: ApiShowNotification;

  openWindow: (id: string) => Promise<void>;
  resizeBaseWindow: (size: 'small' | 'medium' | 'large' | '') => void;
  onBaseWindowResized: (
    callback: (_: IpcRendererEvent) => void
  ) => Electron.IpcRenderer;

  openDevTools: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  hideWindow: ApiHideWindow;
  closeWindow: ApiCloseWindow;
  quitApp: ApiEmptyPromiseRequest;

  getSharedState: (stateId: SyncID) => Promise<string | boolean>;
  syncSharedState: (
    callback: (
      _: IpcRendererEvent,
      data: { syncId: SyncID; state: string | boolean }
    ) => void
  ) => void;
  relaySharedState: (syncId: SyncID, state: string | boolean) => void;

  handleOpenTab: (
    callback: (_: IpcRendererEvent, tabData: TabData) => void
  ) => void;

  doLedgerTask: (
    task: LedgerTask,
    serialized: string
  ) => Promise<SerLedgerTaskResponse>;

  requestImportedAccounts: ApiEmptyRequest;

  reportNewEvent: ApiReportNewEvent;
  reportDismissEvent: ApiReportDismissEvent;
  openBrowserURL: ApiOpenBrowserWindow;

  initAnalytics: (agent: string, windowId: string, lang: string) => void;
  umamiEvent: (event: string, data: AnyData | null) => void;
}

// Types of MyAPI methods.

type ApiEmptyRequest = () => void;
type ApiEmptyPromiseRequest = () => Promise<void>;
type ApiHideWindow = (id: string) => void;
type ApiCloseWindow = (id: string) => void;

type ApiReportNewEvent = (
  callback: (_: IpcRendererEvent, eventData: EventCallback) => void
) => Electron.IpcRenderer;

type ApiReportDismissEvent = (
  callback: (_: IpcRendererEvent, eventData: DismissEvent) => void
) => Electron.IpcRenderer;

type ApiOpenBrowserWindow = (url: string) => void;

/**
 * New types
 */

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
