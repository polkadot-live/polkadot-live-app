// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Supported chains as string literals.
export type ChainID =
  | 'Polkadot'
  | 'Polkadot Asset Hub'
  | 'Polkadot People'
  | 'Kusama'
  | 'Kusama Asset Hub'
  | 'Kusama People'
  | 'Westend'
  | 'Westend Asset Hub'
  | 'Westend People';

// Connection status of a chain.
export type ChainStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

// For network select box.
export interface LedgerSelectNetworkData {
  network: string;
  ledgerId: string;
  iconWidth: number;
}
