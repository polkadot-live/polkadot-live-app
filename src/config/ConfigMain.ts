// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MessageChannelMain } from 'electron';

interface PortPair {
  portMain: Electron.MessagePortMain;
  portImport: Electron.MessagePortMain;
}

export class ConfigMain {
  static port1: Electron.MessagePortMain;
  static port2: Electron.MessagePortMain;

  // Instantiate message port pair for `main` and `import` window communcation
  // and store in static class for easy retrieval.
  static initialize = (): void => {
    const { port1, port2 } = new MessageChannelMain();

    ConfigMain.port1 = port1;
    ConfigMain.port2 = port2;
  };

  // Return message port pair for `main` and `import` window communication.
  static getPortsForMainAndImport = (): PortPair => {
    if (!ConfigMain.port1 || !ConfigMain.port2) {
      ConfigMain.initialize();
    }

    return {
      portMain: ConfigMain.port1,
      portImport: ConfigMain.port2,
    };
  };
}
