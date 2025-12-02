// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, TxAction, UriAction } from '@polkadot-live/types';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';

export interface EventMeta {
  category: string;
  chainId: ChainID;
  subtitle?: string;
  title?: string;
  txActions?: TxAction[];
  uriActions?: UriAction[];
  data?: AnyData;
}

export interface WhoMeta {
  accountName: string;
  address: string;
  chainId: ChainID;
  source: AccountSource;
}
