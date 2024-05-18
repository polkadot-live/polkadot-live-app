// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name Config
 * @summary Configuration class for the `openGov` window. Accessed in the openGov renderer.
 */
export class Config {
  // Cache the Open Gov window's message port to facilitate communication to the `main` renderer.
  private static _portOpenGov: MessagePort;

  // Accessors.
  static get portOpenGov(): MessagePort {
    if (!Config._portOpenGov) {
      throw new Error('_portOpenGov still undefined');
    }

    return Config._portOpenGov;
  }

  static set portOpenGov(port: MessagePort) {
    Config._portOpenGov = port;
  }
}
