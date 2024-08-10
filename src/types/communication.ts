// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';

export type PortPairID =
  | 'main-import'
  | 'main-action'
  | 'main-settings'
  | 'main-openGov';

export interface PortPair {
  port1: Electron.MessagePortMain;
  port2: Electron.MessagePortMain;
}

export interface IpcTask {
  action: 'raw-account:persist' | 'raw-account:delete' | 'raw-account:remove';
  data: AnyData;
}
