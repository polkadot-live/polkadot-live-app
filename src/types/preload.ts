// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IpcRendererEvent } from 'electron';
import type { ChainID } from './chains';
import type { AnyJson } from './misc';
import type { LedgerTask } from './ledger';
import type { AccountSource } from './accounts';
import type { ImportedAccounts } from '@/model/Account';
import type { DismissEvent, EventCallback } from './reporter';
import type { TxStatus } from './tx';

export interface PreloadAPI {
  quitApp: ApiEmptyRequest;
  hideWindow: ApiHideWindow;
  closeWindow: ApiCloseWindow;
  syncChain: ApiSyncChain;
  chainAdded: ApiChainEvent;
  chainRemoved: ApiChainEvent;
  chainConnected: ApiChainEvent;
  chainDisconnected: ApiChainEvent;
  removeChain: ApiRemoveChain;

  openWindow: ApiOpenWindow;

  doLedgerLoop: ApiDoLedgerLoop;
  reportLedgerStatus: ApiReportLedgerStatus;

  requestImportedAccounts: ApiEmptyRequest;
  newAddressImported: ApiNewAddressImported;
  removeImportedAccount: ApiRemoveImportedAccount;
  reportImportedAccounts: ApiReportImportedAccounts;
  reportAccountState: ApiReportAccountState;

  reportNewEvent: ApiReportNewEvent;
  reportDismissEvent: ApiReportDismissEvent;
  requestInitTx: ApiRequestInitTx;
  requestResetTx: ApiEmptyRequest;
  requestDismissEvent: ApiRequestDismissEvent;
  reportSignedVaultTx: ApRreportSignedVaultTx;
  reportTx: APIReportTx;
  reportTxStatus: ApiReportTxStatus;

  reportChainSubscriptionState: ApiReportChainSubscriptions;
  reportAccountSubscriptionsState: ApiReportAccountSubscriptions;

  openBrowserURL: ApiOpenBrowserWindow;
}

// Types of MyAPI methods.

type ApiEmptyRequest = () => void;
type ApiHideWindow = (id: string) => void;
type ApiCloseWindow = (id: string) => void;

type ApiSyncChain = (
  callback: (_: IpcRendererEvent, name: string) => void
) => Electron.IpcRenderer;

type ApiChainEvent = (
  callback: (_: IpcRendererEvent, name: string) => void
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
  callback: (_: IpcRendererEvent, accounts: ImportedAccounts) => void
) => Electron.IpcRenderer;

type ApiReportAccountState = (
  callback: (
    _: IpcRendererEvent,
    chain: ChainID,
    address: string,
    key: string,
    value: string
  ) => void
) => Electron.IpcRenderer;

type ApiReportNewEvent = (
  callback: (_: IpcRendererEvent, eventData: EventCallback) => void
) => Electron.IpcRenderer;

type ApiReportDismissEvent = (
  callback: (_: IpcRendererEvent, eventData: DismissEvent) => void
) => Electron.IpcRenderer;

type ApiRequestInitTx = (
  chain: ChainID,
  from: string,
  nonce: number,
  pallet: string,
  method: string,
  args: AnyJson[]
) => void;

type ApiRequestDismissEvent = (eventData: DismissEvent) => void;

type ApiOpenBrowserWindow = (url: string) => void;

type APIReportTx = (
  callback: (_: IpcRendererEvent, txData: APIReportTxData) => void
) => Electron.IpcRenderer;

type ApiReportTxStatus = (
  callback: (_: IpcRendererEvent, status: TxStatus) => void
) => Electron.IpcRenderer;

type APIReportTxData = {
  estimatedFee: AnyJson;
  txId: AnyJson;
  payload: AnyJson;
  setGenesisHash: AnyJson;
};

type ApRreportSignedVaultTx = (signature: AnyJson) => void;

type ApiReportChainSubscriptions = (callback: AnyJson) => void;

type ApiReportAccountSubscriptions = (callback: AnyJson) => void;
