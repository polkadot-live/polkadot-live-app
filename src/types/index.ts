// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PolkadotAccountState } from '@polkadot-live/types/chains/polkadot';

// Chain types

export type ChainID = 'Polkadot';

export type ChainStatus = 'connecting' | 'connected' | 'disconnected';

export type SomeChainState = PolkadotAccountState;

export enum AccountType {
  User,
  Delegate,
}
// Transaction types

export type TxStatus =
  | 'pending'
  | 'submitted'
  | 'in_block'
  | 'finalized'
  | 'error';

// Any types

// eslint-disable-next-line
export type AnyData = any;
