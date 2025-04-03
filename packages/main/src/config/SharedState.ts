// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WcSyncFlags } from '@polkadot-live/types/walletConnect';

export class SharedState {
  private static _exportingData = false;
  private static _onlineMode = false;

  // Relayed state.
  private static _importingData = false;
  private static _importingAccount = false;
  private static _isBuildingExtrinsic = false;
  private static _wcSyncFlags: WcSyncFlags = {
    wcAccountApproved: false,
    wcConnecting: false,
    wcDisconnecting: false,
    wcInitialized: false,
    wcSessionRestored: false,
    wcVerifyingAccount: false,
  };

  static get exportingData(): boolean {
    return this._exportingData;
  }

  static set exportingData(flag: boolean) {
    this._exportingData = flag;
  }

  static get importingData(): boolean {
    return this._importingData;
  }

  static set importingData(flag: boolean) {
    this._importingData = flag;
  }

  static get importingAccount(): boolean {
    return this._importingAccount;
  }

  static set importingAccount(flag: boolean) {
    this._importingAccount = flag;
  }

  static get onlineMode(): boolean {
    return this._onlineMode;
  }

  static set onlineMode(flag: boolean) {
    this._onlineMode = flag;
  }

  static get isBuildingExtrinsic(): boolean {
    return this._isBuildingExtrinsic;
  }

  static set isBuildingExtrinsic(flag: boolean) {
    this._isBuildingExtrinsic = flag;
  }

  static get wcSyncFlags(): WcSyncFlags {
    return this._wcSyncFlags;
  }

  static set wcSyncFlags(flags: WcSyncFlags) {
    this._wcSyncFlags = flags;
  }
}
