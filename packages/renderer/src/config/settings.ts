// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name Config
 * @summary Configuration class for the `settings` window. Accessed in the settings renderer.
 */
export class Config {
  // Cache the settings window's message port to facilitate communication to the `main` renderer.
  private static _portSettings: MessagePort;

  // Accessors.
  static get portSettings(): MessagePort {
    if (!Config._portSettings) {
      throw new Error('_portSettings still undefined');
    }

    return Config._portSettings;
  }

  static set portSettings(port: MessagePort) {
    Config._portSettings = port;
  }
}
