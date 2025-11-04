// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ImportedGenericAccount } from '@polkadot-live/types';

export interface RemoveHandlerAdaptor {
  updateAddressInStore: (account: ImportedGenericAccount) => Promise<void>;
  postToMain: (address: string, chainId: ChainID) => void;
}
