// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name Config
 * @summary Configuration class for the `action` window. Accessed in the action renderer.
 */
export class Config {
  // Cache the action window's message port to facilitate communication with the `main` renderer.
  private static _portAction: MessagePort;

  // Get the `action` window's message port to `main` window.
  static get portAction(): MessagePort {
    if (!Config._portAction) {
      throw new Error('_portAction still undefined');
    }

    return Config._portAction;
  }

  // Set the `action` window's message port for `main` window.
  static set portAction(port: MessagePort) {
    Config._portAction = port;
  }
}
