// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * @name ConfigTabs
 * @summary Configuration class for the `tabs` window.
 */
export class ConfigTabs {
  // Cache message port to facilitate communication to the `main` renderer.
  private static _portToMain: MessagePort;
  static _portExists = false;

  static get portToMain(): MessagePort {
    if (!this._portToMain) {
      throw new Error('_portToMain still undefined');
    }
    return this._portToMain;
  }

  static set portToMain(port: MessagePort) {
    this._portToMain = port;
    this._portExists = true;
  }
}
