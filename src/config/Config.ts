// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MessageChannelMain } from 'electron';

interface PortPair {
  portMain: Electron.MessagePortMain;
  portImport: Electron.MessagePortMain;
}

export class Config {
  static port1: Electron.MessagePortMain;
  static port2: Electron.MessagePortMain;

  static initialize = () => {
    const { port1, port2 } = new MessageChannelMain();

    Config.port1 = port1;
    Config.port2 = port2;
  };

  static getPortsForMainAndImport = (): PortPair => {
    if (!Config.port1 || !Config.port2) {
      Config.initialize();
    }

    return {
      portMain: Config.port1,
      portImport: Config.port2,
    };
  };
}
