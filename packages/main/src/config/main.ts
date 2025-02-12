// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MessageChannelMain } from 'electron';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { PortPair, PortPairID } from '@polkadot-live/types/communication';
import type { WcSyncFlags } from '@polkadot-live/types/walletConnect';
import type { Rectangle, Tray } from 'electron';

export class Config {
  // Storage keys.
  private static _chainSubscriptionsStorageKey = 'chain_subscriptions';
  private static _settingsStorageKey = 'app_settings';
  private static _workspacesStorageKey = 'developer_console_workspaces';

  // Raw account storage keys.
  private static _ledgerAddressesStorageKey = 'ledger_addresses';
  private static _vaultAddressesStorageKey = 'vault_addresses';
  private static _readOnlyAddressesStorageKey = 'read_only_addresses';
  private static _wcAddressesStorageKey = 'wc_addresses';

  // Main window's docked properties.
  private static _dockedWidth = 490;
  private static _dockedHeight = 620;

  // Child window properties.
  private static _childWidth = 780;
  private static _themeColorDark = '#1c1c1c';
  private static _themeColorLight = '#e3e3e3';

  // Cache port pairs to be sent to their respective windows.
  private static _main_import_ports: PortPair;
  private static _main_action_ports: PortPair;
  private static _main_settings_ports: PortPair;
  private static _main_openGov_ports: PortPair;

  // Cache Electron objects.
  private static _appTray: Tray | null = null;

  // Flags to handle data processes.
  private static _exportingData = false;
  private static _importingData = false;
  private static _onlineMode = false;
  private static _isBuildingExtrinsic = false;
  private static _wcSyncFlags: WcSyncFlags = {
    wcConnecting: false,
    wcDisconnecting: false,
    wcInitialized: false,
    wcSessionRestored: false,
  };

  // Return the local storage key for corresponding source addresses.
  static getStorageKey(source: AccountSource): string {
    switch (source) {
      case 'ledger': {
        return Config._ledgerAddressesStorageKey;
      }
      case 'vault': {
        return Config._vaultAddressesStorageKey;
      }
      case 'read-only': {
        return Config._readOnlyAddressesStorageKey;
      }
      case 'wallet-connect': {
        return Config._wcAddressesStorageKey;
      }
      default: {
        throw new Error('source not recognized');
      }
    }
  }

  // Return port pair to facilitate window communication.
  static getPortPair = (id: PortPairID): PortPair => {
    switch (id) {
      case 'main-import': {
        return Config._main_import_ports;
      }
      case 'main-action': {
        return Config._main_action_ports;
      }
      case 'main-settings': {
        return Config._main_settings_ports;
      }
      case 'main-openGov': {
        return Config._main_openGov_ports;
      }
      default: {
        throw new Error('Port pair id not recognized');
      }
    }
  };

  // Get local storage key for chain subscription tasks.
  static getChainSubscriptionsStorageKey(): string {
    return Config._chainSubscriptionsStorageKey;
  }

  // Get local storage key for subscription tasks of a particular address.
  static getSubscriptionsStorageKeyFor(address: string): string {
    return `${address}_subscriptions`;
  }

  // Initialize ports to facilitate communication between the main and other renderers.
  static initPorts(id: PortPairID): void {
    switch (id) {
      case 'main-import': {
        const { port1, port2 } = new MessageChannelMain();
        Config._main_import_ports = { port1, port2 };
        break;
      }
      case 'main-action': {
        const { port1, port2 } = new MessageChannelMain();
        Config._main_action_ports = { port1, port2 };
        break;
      }
      case 'main-settings': {
        const { port1, port2 } = new MessageChannelMain();
        Config._main_settings_ports = { port1, port2 };
        break;
      }
      case 'main-openGov': {
        const { port1, port2 } = new MessageChannelMain();
        Config._main_openGov_ports = { port1, port2 };
        break;
      }
      default: {
        throw new Error('Port pair id not recognized');
      }
    }
  }

  // Accessors.
  static get settingsStorageKey(): string {
    return Config._settingsStorageKey;
  }

  static get workspacesStorageKey(): string {
    return Config._workspacesStorageKey;
  }

  static get dockedWidth(): number {
    return Config._dockedWidth;
  }

  static set dockedWidth(width: number) {
    Config._dockedWidth = width;
  }

  static get dockedHeight(): number {
    return Config._dockedHeight;
  }

  static set dockedHeight(height: number) {
    Config._dockedHeight = height;
  }

  static get childWidth(): number {
    return Config._childWidth;
  }

  static set childWidth(width: number) {
    Config._childWidth = width;
  }

  static get themeColorDark(): string {
    return Config._themeColorDark;
  }

  static get themeColorLight(): string {
    return Config._themeColorLight;
  }

  static get exportingData(): boolean {
    return Config._exportingData;
  }

  static set exportingData(flag: boolean) {
    Config._exportingData = flag;
  }

  static get importingData(): boolean {
    return Config._importingData;
  }

  static set importingData(flag: boolean) {
    Config._importingData = flag;
  }

  static get onlineMode(): boolean {
    return Config._onlineMode;
  }

  static set onlineMode(flag: boolean) {
    Config._onlineMode = flag;
  }

  static get isBuildingExtrinsic(): boolean {
    return Config._isBuildingExtrinsic;
  }

  static set isBuildingExtrinsic(flag: boolean) {
    Config._isBuildingExtrinsic = flag;
  }

  static get wcSyncFlags(): WcSyncFlags {
    return Config._wcSyncFlags;
  }

  static set wcSyncFlags(flags: WcSyncFlags) {
    Config._wcSyncFlags = flags;
  }

  // Setter for app's tray object.
  static set appTray(tray: Tray) {
    Config._appTray = tray;
  }

  // Get app tray's bounds.
  static getAppTrayBounds(): Rectangle {
    if (!Config._appTray) {
      throw new Error('App tray is null');
    }
    return Config._appTray.getBounds();
  }
}
