// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { IpcTreasuryInfo } from '@polkadot-live/types/treasury';
import type { SetStateAction } from 'react';

export interface TreasuryAdapter {
  initTreasury: (
    chainId: ChainID,
    setFetchingTreasuryData: (value: SetStateAction<boolean>) => void,
    setTreasuryData: (data: IpcTreasuryInfo) => void,
  ) => void;
}
