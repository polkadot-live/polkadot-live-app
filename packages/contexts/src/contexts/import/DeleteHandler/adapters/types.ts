// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface DeleteHandlerAdapter {
  removeFromStore: (
    source: AccountSource,
    publicKeyHex: string,
  ) => Promise<void>;
  postToMain: (address: string, chainId: ChainID) => void;
}
