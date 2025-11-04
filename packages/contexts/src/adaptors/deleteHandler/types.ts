// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { AccountSource } from '@polkadot-live/types';

export interface DeleteHandlerAdaptor {
  removeFromStore: (
    source: AccountSource,
    publicKeyHex: string
  ) => Promise<void>;
  postToMain: (address: string, chainId: ChainID) => void;
}
