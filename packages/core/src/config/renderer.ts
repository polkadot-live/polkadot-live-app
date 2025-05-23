// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name ConfigRenderer
 * @summary Configuration class for the `main` window. Accessed in the main renderer.
 */
export class ConfigRenderer {
  // Cache the main window's message ports to communicate with child windows.
  static _portToImport: MessagePort;
  static _portToAction: MessagePort;
  static _portToSettings: MessagePort;
  static _portToOpenGov: MessagePort;

  // App settings handled by main renderer (use in callbacks).
  private static _silenceNotifications = false;
  private static _showDebuggingSubscriptions = false;
  private static _enableAutomaticSubscriptions = true;
  private static _keepOutdatedEvents = true;

  // Flag set to `true` when app wants to abort connection processing.
  private static _abortConnecting = false;

  // Accessors for `action` port.
  static get portToAction(): MessagePort | null {
    return this._portToAction ? this._portToAction : null;
  }
  static set portToAction(port: MessagePort) {
    this._portToAction = port;
  }

  // Accessors for `import` port.
  static get portToImport(): MessagePort | null {
    return this._portToImport ? this._portToImport : null;
  }
  static set portToImport(port: MessagePort) {
    this._portToImport = port;
  }

  // Accessors for `openGov` port.
  static get portToOpenGov(): MessagePort | null {
    return this._portToOpenGov ? this._portToOpenGov : null;
  }
  static set portToOpenGov(port: MessagePort) {
    this._portToOpenGov = port;
  }

  // Accessors for `settings` port.
  static get portToSettings(): MessagePort | null {
    return this._portToSettings ? this._portToSettings : null;
  }
  static set portToSettings(port: MessagePort) {
    this._portToSettings = port;
  }

  // Accessors for `_silenceNotifications` flag.
  static get silenceNotifications(): boolean {
    return this._silenceNotifications;
  }
  static set silenceNotifications(flag: boolean) {
    this._silenceNotifications = flag;
  }

  // Accessors for `_showDebuggingSubscriptions` flag.
  static get showDebuggingSubscriptions(): boolean {
    return this._showDebuggingSubscriptions;
  }
  static set showDebuggingSubscriptions(flag: boolean) {
    this._showDebuggingSubscriptions = flag;
  }

  // Accessors for `_enableAutomaticSubscriptions` flag.
  static get enableAutomaticSubscriptions(): boolean {
    return this._enableAutomaticSubscriptions;
  }
  static set enableAutomaticSubscriptions(flag: boolean) {
    this._enableAutomaticSubscriptions = flag;
  }

  // Accessors for `_enableAutomaticSubscriptions` flag.
  static get keepOutdatedEvents(): boolean {
    return this._keepOutdatedEvents;
  }
  static set keepOutdatedEvents(flag: boolean) {
    this._keepOutdatedEvents = flag;
  }

  // Accessors for `_abortConnecting` flag.
  static get abortConnecting(): boolean {
    return this._abortConnecting;
  }
  static set abortConnecting(flag: boolean) {
    this._abortConnecting = flag;
  }
}
