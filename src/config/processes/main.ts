// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MessageChannelMain } from 'electron';
import type { PortPair, PortPairID } from '@/types/communication';
import type { Rectangle, Tray } from 'electron';

export class Config {
  // Main window's docked width and height.
  private static _dockedWidth = 420;
  private static _dockedHeight = 575;

  // Cache port pairs to be sent to their respective windows.
  private static _main_import_ports: PortPair;
  private static _main_action_ports: PortPair;

  // Cache the app's tray object.
  private static _appTray: Tray | null = null;

  private static _chainSubscriptionsStorageKey = 'chain_subscriptions';

  // Instantiate message port pairs to facilitate communication between the
  // main renderer and another renderer.
  static initialize = (): void => {
    const ids: PortPairID[] = ['main-import', 'main-action'];

    for (const id of ids) {
      Config.initPorts(id);
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
      default: {
        throw new Error('Port pair id not recognized');
      }
    }
  }

  // Accessors for app's docked window size.
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
