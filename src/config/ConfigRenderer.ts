// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export class ConfigRenderer {
  private static _portMain: MessagePort;
  private static _portImport: MessagePort;

  static get portMain(): MessagePort {
    if (!ConfigRenderer._portMain) {
      throw new Error('_portMain still undefined.');
    }

    return ConfigRenderer._portMain;
  }

  static set portMain(port: MessagePort) {
    ConfigRenderer._portMain = port;
  }

  static get portImport(): MessagePort {
    if (!ConfigRenderer._portImport) {
      throw new Error('_portImport still undefined.');
    }

    return ConfigRenderer._portImport;
  }

  static set portImport(port: MessagePort) {
    ConfigRenderer._portImport = port;
  }
}
