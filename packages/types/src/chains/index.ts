// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Ecosystem IDs.
export type EcosystemID = 'Polkadot' | 'Kusama' | 'Paseo' | 'Westend';

// Supported chains as string literals.
export type ChainID =
  | 'Polkadot Relay'
  | 'Polkadot Asset Hub'
  | 'Polkadot People'
  | 'Kusama Relay'
  | 'Kusama Asset Hub'
  | 'Kusama People'
  | 'Paseo Relay'
  | 'Westend Relay'
  | 'Westend Asset Hub'
  | 'Westend People';

// Chain names from `rpc.system.chain`.
export type RpcSystemChain =
  | 'Polkadot'
  | 'Polkadot Asset Hub'
  | 'Polkadot People'
  | 'Kusama'
  | 'Kusama Asset Hub'
  | 'Kusama People'
  | 'Paseo Testnet'
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
