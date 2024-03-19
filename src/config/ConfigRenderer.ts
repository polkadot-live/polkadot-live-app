// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export class ConfigRenderer {
  // Cache the main or import window's message port.
  // (main <--> import)
  private static _portMain: MessagePort;

  // Cache the main or action window's message port.
  // (main <--> action)
  private static _portMainB: MessagePort;

  // Return the main window's message port.
  static get portMain(): MessagePort {
    if (!ConfigRenderer._portMain) {
      throw new Error('_portMain still undefined.');
    }

    return ConfigRenderer._portMain;
  }

  // Set the `main` window's message port.
  static set portMain(port: MessagePort) {
    ConfigRenderer._portMain = port;
  }

  // Return `main` window's message port for `action` window.
  static get portMainB(): MessagePort {
    if (!ConfigRenderer._portMainB) {
      throw new Error('_portMainB still undefined');
    }

    return ConfigRenderer._portMainB;
  }

  // Set the `main` window's message port for `action` window.
  static set portMainB(port: MessagePort) {
    ConfigRenderer._portMainB = port;
  }
}
