// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SettingKey } from '@polkadot-live/types/settings';

/**
 * @name ConfigRenderer
 * @summary Configuration class for the `main` window. Accessed in the main renderer.
 */
export class ConfigRenderer {
  // Cache the main window's message ports to communicate with child windows.
  static _portToTabs: MessagePort;

  // App settings handled by main renderer (use in callbacks).
  static _appSettings = new Map<SettingKey, boolean>();

  static setAppSettings = (map: Map<SettingKey, boolean>) =>
    (this._appSettings = map);

  static getAppSeting = (key: SettingKey) =>
    Boolean(this._appSettings.get(key));

  // Flag set to `true` when app wants to abort connection processing.
  private static _abortConnecting = false;

  // Accessors for `tabs` port.
  static get portToTabs(): MessagePort | null {
    return ConfigRenderer._portToTabs ?? null;
  }
  static set portToTabs(port: MessagePort) {
    ConfigRenderer._portToTabs = port;
  }

  // Accessors for `_abortConnecting` flag.
  static get abortConnecting(): boolean {
    return ConfigRenderer._abortConnecting;
  }
  static set abortConnecting(flag: boolean) {
    ConfigRenderer._abortConnecting = flag;
  }
}
