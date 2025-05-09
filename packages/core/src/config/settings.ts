// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name ConfigSettings
 * @summary Configuration class for the `settings` window. Accessed in the settings renderer.
 */
export class ConfigSettings {
  // Cache the settings window's message port to facilitate communication to the `main` renderer.
  private static _portSettings: MessagePort;

  // Accessors.
  static get portSettings(): MessagePort {
    if (!this._portSettings) {
      throw new Error('_portSettings still undefined');
    }

    return this._portSettings;
  }

  static set portSettings(port: MessagePort) {
    this._portSettings = port;
  }
}
