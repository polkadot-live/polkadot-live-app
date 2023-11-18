// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { PolkadotAccountState } from './polkadot';

// Supported chains as string literals.
export type ChainID = 'Polkadot';

// Supported chain states.
export type SomeChainState = PolkadotAccountState;

// Connection status of a chain.
export type ChainStatus = 'connecting' | 'connected' | 'disconnected';
