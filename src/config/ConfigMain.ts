// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MessageChannelMain } from 'electron';

interface PortPair {
  port1: Electron.MessagePortMain;
  port2: Electron.MessagePortMain;
}

export class ConfigMain {
  private static _main_import_ports: PortPair;

  private static _chainSubscriptionsStorageKey = 'chain_subscriptions';

  // Instantiate message port pair for `main` and `import` window communcation
  // and store in static class for easy retrieval.
  static initialize = (): void => {
    const { port1, port2 } = new MessageChannelMain();

    ConfigMain._main_import_ports = { port1, port2 };
  };

  // Return message port pair for `main` and `import` window communication.
  static getMainImportPorts = (): PortPair => {
    if (!ConfigMain._main_import_ports) {
      ConfigMain.initialize();
    }

    return ConfigMain._main_import_ports;
  };

  // Get local storage key for chain subscription tasks.
  static getChainSubscriptionsStorageKey(): string {
    return ConfigMain._chainSubscriptionsStorageKey;
  }

  // Get local storage key for subscription tasks of a particular address.
  static getSubscriptionsStorageKeyFor(address: string): string {
    return `${address}_subscriptions`;
  }
}
