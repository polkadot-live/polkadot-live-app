// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MessageChannelMain } from 'electron';
import type { PortPair, PortPairID } from '@polkadot-live/types/communication';
import type { Rectangle, Tray } from 'electron';

export class Config {
  // Main window's docked properties.
  private static _dockedWidth = 490;
  private static _dockedHeight = 720;

  // Child window properties.
  private static _childWidth = 780;
  private static _themeColorDark = '#111';
  private static _themeColorLight = '#eee';

  // Cache port pairs to be sent to their respective windows.
  private static _main_tabs_ports: PortPair;

  // Cache Electron objects.
  private static _appTray: Tray | null = null;

  // Return port pair to facilitate window communication.
  static getPortPair = (id: PortPairID): PortPair => {
    switch (id) {
      case 'main-tabs': {
        return Config._main_tabs_ports;
      }
      default: {
        throw new Error('Port pair id not recognized');
      }
    }
  };

  // Initialize ports to facilitate communication between the main and other renderers.
  static initPorts(id: PortPairID): void {
    switch (id) {
      case 'main-tabs': {
        const { port1, port2 } = new MessageChannelMain();
        Config._main_tabs_ports = { port1, port2 };
        break;
      }
      default: {
        throw new Error('Port pair id not recognized');
      }
    }
  }

  // Accessors.
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
