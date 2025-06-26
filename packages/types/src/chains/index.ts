// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Supported chains as string literals.
export type ChainID =
  | 'Polkadot'
  | 'Polkadot Asset Hub'
  | 'Kusama'
  | 'Westend'
  | 'Westend Asset Hub';

// Connection status of a chain.
export type ChainStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

// For network select box.
export interface SelectNetworkData {
  network: string;
  ledgerId: string;
  iconWidth: number;
  iconFill: string;
}
