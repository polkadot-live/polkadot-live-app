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
    // Accounts
    | 'account:import'
    | 'account:remove'
    | 'account:getAll'
    | 'account:updateAll'
    // Connection
    | 'connection:init'
    | 'connection:getStatus'
    | 'connection:setStatus'
    // Events
    | 'events:persist'
    | 'events:remove'
    | 'events:makeStale'
    | 'events:update:accountName'
    // Subscriptions (Account)
    | 'subscriptions:account:getAll'
    | 'subscriptions:account:update'
    | 'subscriptions:chain:getAll'
    | 'subscriptions:chain:update'
    // Subscriptions (Interval)
    | 'interval:task:get'
    | 'interval:task:clear'
    | 'interval:task:add'
    | 'interval:task:remove'
    | 'interval:task:update'
    // Settings
    | 'settings:set:docked'
    | 'settings:toggle'
    | 'settings:toggle:allWorkspaces'
    // Workspaces
    | 'workspaces:getAll'
    | 'workspaces:delete'
    | 'workspaces:launch';
  data: AnyData;
}
