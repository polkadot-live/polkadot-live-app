// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MessageChannelMain } from 'electron';
import { store } from '@/main';
import type { PortPair, PortPairID } from '@/types/communication';
import type { Rectangle, Tray } from 'electron';
import type { PersistedSettings } from '@/renderer/screens/Settings/types';
import type { AnyData } from '@/types/misc';

export class Config {
  // Storage keys.
  private static _chainSubscriptionsStorageKey = 'chain_subscriptions';
  private static _settingsStorageKey = 'app_settings';

  // Main window's docked properties.
  private static _dockedWidth = 420;
  private static _dockedHeight = 575;

  // Child window properties.
  private static _childWidth = 700;

  // Cache port pairs to be sent to their respective windows.
  private static _main_import_ports: PortPair;
  private static _main_action_ports: PortPair;
  private static _main_settings_ports: PortPair;
  private static _main_openGov_ports: PortPair;

  // Cache Electron objects.
  private static _appTray: Tray | null = null;

  // Flags to handle data processes.
  private static _exportingData = false;

  // Instantiate message port pairs to facilitate communication between the
  // main renderer and another renderer.
  static initialize = (): void => {
    const ids: PortPairID[] = [
      'main-import',
      'main-action',
      'main-settings',
      'main-openGov',
    ];

    for (const id of ids) {
      Config.initPorts(id);
    }
  };

  // Initialise default settings.
  static getAppSettings = (): PersistedSettings => {
    const key = Config._settingsStorageKey;

    if (store.has(key)) {
      // Return persisted settings.
      return (store as Record<string, AnyData>).get(key);
    } else {
      const settings: PersistedSettings = {
        appDocked: true,
        appSilenceOsNotifications: false,
        appShowOnAllWorkspaces: true,
      };

      // Persist default settings to store and return them.
      (store as Record<string, AnyData>).set(key, settings);
      return settings;
    }
  };

  // Return port pair to facilitate window communication.
  static getPortPair = (id: PortPairID): PortPair => {
    switch (id) {
      case 'main-import': {
        if (!Config._main_import_ports) {
          Config.initPorts('main-import');
        }

        return Config._main_import_ports;
      }
      case 'main-action': {
        if (!Config._main_action_ports) {
          Config.initPorts('main-action');
        }

        return Config._main_action_ports;
      }
      case 'main-settings': {
        if (!Config._main_settings_ports) {
          Config.initPorts('main-settings');
        }

        return Config._main_settings_ports;
      }
      case 'main-openGov': {
        if (!Config._main_openGov_ports) {
          Config.initPorts('main-openGov');
        }

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
  private static initPorts(id: PortPairID): void {
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

  static get exportingData(): boolean {
    return Config._exportingData;
  }

  static set exportingData(flag: boolean) {
    Config._exportingData = flag;
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
