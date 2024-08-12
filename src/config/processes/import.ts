// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name Config
 * @summary Configuration class for the `import` window. Accessed in the import renderer.
 */
export class Config {
  // Cache the import window's message port to to facilitate communication to the `main` renderer.
  private static _portImport: MessagePort;

  // Get the `import` window's message port.
  static get portImport(): MessagePort {
    if (!Config._portImport) {
      throw new Error('_portImport still undefined.');
    }

    return Config._portImport;
  }

  // Set the `import` window's message port.
  static set portImport(port: MessagePort) {
    Config._portImport = port;
  }
}
