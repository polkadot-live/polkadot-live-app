// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from './misc';

export type SyncID =
  // Importing an account to main window flag.
  | 'account:importing'
  // Exporting backup data flag.
  | 'backup:exporting'
  // Importing data from backup file flag.
  | 'backup:importing'
  // Building extrinsics flag.
  | 'extrinsic:building'
  // Internet connection flag.
  | 'mode:connected'
  // Dark mode flag.
  | 'mode:dark'
  // Online mode flag.
  | 'mode:online'
  // WalletConnect flags.
  | 'wc:connecting'
  | 'wc:disconnecting'
  | 'wc:initialized'
  | 'wc:session:restored';

export interface TabData {
  id: number;
  label: string;
  viewId: string;
}

export type PortPairID = 'main-tabs';

export interface PortPair {
  port1: Electron.MessagePortMain;
  port2: Electron.MessagePortMain;
}

export interface IpcTask {
  action: // Addresses
    | 'raw-account:add'
    | 'raw-account:delete'
    | 'raw-account:get'
    | 'raw-account:get:ledger-meta'
    | 'raw-account:getAll'
    | 'raw-account:import'
    | 'raw-account:persist'
    | 'raw-account:remove'
    | 'raw-account:update'
    // Accounts
    | 'account:import'
    | 'account:remove'
    | 'account:getAll'
    | 'account:updateAll'
    // Connection
    | 'connection:init'
    | 'connection:getStatus'
    // Events
    | 'events:clearAll'
    | 'events:counts'
    | 'events:fetch'
    | 'events:persist'
    | 'events:remove'
    | 'events:makeStale'
    | 'events:update:accountName'
    | 'events:import'
    // Chain Events
    | 'chainEvents:getAll'
    | 'chainEvents:getActiveCount'
    | 'chainEvents:insert'
    | 'chainEvents:remove'
    | 'chainEvents:getAllForAccount'
    | 'chainEvents:insertForAccount'
    | 'chainEvents:removeForAccount'
    | 'chainEvents:removeAllForAccount'
    | 'chainEvents:insertRefSubs'
    | 'chainEvents:removeRefSubs'
    | 'chainEvents:getAllRefSubs'
    | 'chainEvents:getAllRefSubsForChain'
    | 'chainEvents:getActiveRefIds'
    // Extrinsics
    | 'extrinsics:getAll'
    | 'extrinsics:getCount'
    | 'extrinsics:import'
    | 'extrinsics:persist'
    | 'extrinsics:remove'
    | 'extrinsics:update'
    | 'extrinsics:addPending'
    | 'extrinsics:getPending'
    // Subscriptions (Account)
    | 'subscriptions:account:getAll'
    | 'subscriptions:account:update'
    | 'subscriptions:account:import'
    | 'subscriptions:chain:getAll'
    | 'subscriptions:chain:update'
    // Subscriptions (Interval)
    | 'interval:task:add'
    | 'interval:task:clear'
    | 'interval:task:get'
    | 'interval:task:remove'
    | 'interval:task:update'
    | 'interval:tasks:import'
    | 'interval:tasks:remove'
    // Settings
    | 'settings:handle';
  data: AnyData;
}
