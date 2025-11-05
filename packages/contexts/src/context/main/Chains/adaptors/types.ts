// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAPIData } from '@polkadot-live/types';
import type { SetStateAction } from 'react';

export interface ChainsAdaptor {
  listenOnMount: (
    setChains: (value: SetStateAction<Map<ChainID, FlattenedAPIData>>) => void,
    setUiTrigger: (value: SetStateAction<boolean>) => void
  ) => (() => void) | null;
  onDisconnectApi: (chainId: ChainID) => Promise<void>;
  onMount: () => void;
}
