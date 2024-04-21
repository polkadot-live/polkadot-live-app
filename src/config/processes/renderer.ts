// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name Config
 * @summary Configuration class for the `main` window. Accessed in the main renderer.
 */
export class Config {
  // Cache the main window's message port to communicate with `import` window.
  private static _portToImport: MessagePort;

  // Cache the main window's message port to communicate with `action` window.
  private static _portToAction: MessagePort;

  // Flag to silence all native OS notifications.
  private static _silenceNotifications = false;

  // Return the main window's message port.
  static get portToImport(): MessagePort {
    if (!Config._portToImport) {
      throw new Error('_portMain still undefined.');
    }

    return Config._portToImport;
  }

  // Set the `main` window's message port for `import` window.
  static set portToImport(port: MessagePort) {
    Config._portToImport = port;
  }

  // Return `main` window's message port for `action` window.
  static get portToAction(): MessagePort {
    if (!Config._portToAction) {
      throw new Error('_portMainB still undefined');
    }

    return Config._portToAction;
  }

  // Set the `main` window's message port for `action` window.
  static set portToAction(port: MessagePort) {
    Config._portToAction = port;
  }

  // Accessors for `_silenceNotifications` flag.
  static get silenceNotifications(): boolean {
    return Config._silenceNotifications;
  }

  static set silenceNotifications(flag: boolean) {
    Config._silenceNotifications = flag;
  }
}
