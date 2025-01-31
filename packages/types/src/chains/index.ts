// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '../misc';
import type { PolkadotAccountState } from './polkadot';

// Supported chains as string literals.
export type ChainID = 'Polkadot' | 'Westend' | 'Kusama';

// Supported chain states.
export type SomeChainState = PolkadotAccountState;

// Connection status of a chain.
export type ChainStatus = 'connecting' | 'connected' | 'disconnected';

// For network select box.
export interface SelectNetworkData {
  network: string;
  ledgerId: string;
  ChainIcon: AnyData;
  iconWidth: number;
  iconFill: string;
}
