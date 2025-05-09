// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name ConfigImport
 * @summary Configuration class for the `import` window. Accessed in the import renderer.
 */
export class ConfigImport {
  // Cache the import window's message port to to facilitate communication to the `main` renderer.
  private static _portImport: MessagePort;

  // Get the `import` window's message port.
  static get portImport(): MessagePort {
    if (!this._portImport) {
      throw new Error('_portImport still undefined.');
    }

    return this._portImport;
  }

  // Set the `import` window's message port.
  static set portImport(port: MessagePort) {
    this._portImport = port;
  }
}
