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
  action: // Addresses
  | 'raw-account:persist'
    | 'raw-account:delete'
    | 'raw-account:add'
    | 'raw-account:remove'
    | 'raw-account:get'
    | 'raw-account:rename'
    // Account subscriptions
    | 'subscriptions:account:getAll'
    | 'subscriptions:account:update'
    | 'subscriptions:chain:getAll'
    // Interval Subscriptions
    | 'interval:task:get'
    | 'interval:task:clear'
    | 'interval:task:add'
    | 'interval:task:remove'
    | 'interval:task:update';
  data: AnyData;
}
