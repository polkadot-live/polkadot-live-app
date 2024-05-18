// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type PortPairID =
  | 'main-import'
  | 'main-action'
  | 'main-settings'
  | 'main-openGov';

export interface PortPair {
  port1: Electron.MessagePortMain;
  port2: Electron.MessagePortMain;
}
