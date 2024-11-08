// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotAccountState } from './polkadot.js';

// Supported chains as string literals.
export type ChainID = 'Polkadot' | 'Westend' | 'Kusama';

// Supported chain states.
export type SomeChainState = PolkadotAccountState;

// Connection status of a chain.
export type ChainStatus = 'connecting' | 'connected' | 'disconnected';
