// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name ConfigOpenGov
 * @summary Configuration class for the `openGov` window. Accessed in the openGov renderer.
 */
export class ConfigOpenGov {
  // Cache the Open Gov window's message port to facilitate communication to the `main` renderer.
  private static _portOpenGov: MessagePort;
  static _portExists = false;

  // Accessors.
  static get portOpenGov(): MessagePort {
    if (!this._portExists) {
      throw new Error('_portOpenGov still undefined');
    }

    return this._portOpenGov;
  }

  static set portOpenGov(port: MessagePort) {
    this._portOpenGov = port;
    this._portExists = true;
  }
}
