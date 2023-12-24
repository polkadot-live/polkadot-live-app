// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@/types/chains';
import type { AnyJson } from '@/types/misc';

export interface AccountStateContextInterface {
  setAccountStateKey: (
    chain: ChainID,
    address: string,
    key: string,
    value: AnyJson
  ) => void;
  getAccountStateKey: (chain: ChainID, address: string, key: string) => AnyJson;
}

export type AccountState = Record<ChainID, Record<string, AnyJson>>;
