// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name Config
 * @summary Configuration class for the `main` window. Accessed in the main renderer.
 */
export class Config {
  // Cache the main window's message ports to communicate with child windows.
  private static _portToImport: MessagePort;
  private static _portToAction: MessagePort;
  private static _portToSettings: MessagePort;

  // Flag to silence all native OS notifications.
  private static _silenceNotifications = false;

  // Flag set to `true` when app is switching to online mode.
  private static _switchingToOnlineMode = false;

  // Flag set to `true` when app wants to abort connection processing.
  private static _abortConnecting = false;

  // Time in seconds app should wait for processing a one-shot and API connection.
  private static _processingTimeout = 10;

  // Accessors for `import` port.
  static get portToImport(): MessagePort {
    if (!Config._portToImport) {
      throw new Error('_portMain still undefined.');
    }

    return Config._portToImport;
  }

  static set portToImport(port: MessagePort) {
    Config._portToImport = port;
  }

  // Accessors for `action` port.
  static get portToAction(): MessagePort {
    if (!Config._portToAction) {
      throw new Error('_portMainB still undefined');
    }

    return Config._portToAction;
  }

  static set portToAction(port: MessagePort) {
    Config._portToAction = port;
  }

  // Accessors for `settings` port.
  static get portToSettings(): MessagePort {
    if (!Config._portToSettings) {
      throw new Error('_portToSettings still undefined');
    }

    return Config._portToSettings;
  }

  static set portToSettings(port: MessagePort) {
    Config._portToSettings = port;
  }

  // Accessors for `_silenceNotifications` flag.
  static get silenceNotifications(): boolean {
    return Config._silenceNotifications;
  }

  static set silenceNotifications(flag: boolean) {
    Config._silenceNotifications = flag;
  }

  // Accessors for `_switchingToOnlineMode` flag.
  static get switchingToOnlineMode(): boolean {
    return Config._switchingToOnlineMode;
  }

  static set switchingToOnlineMode(flag: boolean) {
    Config._switchingToOnlineMode = flag;
  }

  // Accessors for `_abortConnecting` flag.
  static get abortConnecting(): boolean {
    return Config._abortConnecting;
  }

  static set abortConnecting(flag: boolean) {
    Config._abortConnecting = flag;
  }

  static get processingTimeout(): number {
    return Config._processingTimeout;
  }
}
