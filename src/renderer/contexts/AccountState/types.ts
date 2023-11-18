// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainID } from '@/types/chains';
import { AnyJson } from '@/types/misc';

export type AccountStateContextInterface = {
  setAccountStateKey: (
    chain: ChainID,
    address: string,
    key: string,
    value: AnyJson
  ) => void;
  getAccountStateKey: (chain: ChainID, address: string, key: string) => AnyJson;
};

export type AccountState = Record<ChainID, Record<string, AnyJson>>;
