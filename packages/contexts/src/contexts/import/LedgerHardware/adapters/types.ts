// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ILedgerController,
  LedgerFetchedAddressData,
  LedgerTaskResponse,
  SerLedgerTaskResponse,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface LedgerHardwareAdapter {
  getLedgerAddresses: (
    accountIndices: number[],
    chainId: ChainID,
    controller: ILedgerController | undefined,
  ) => Promise<SerLedgerTaskResponse | LedgerTaskResponse>;
  handleFetchedAddressData: (
    response: SerLedgerTaskResponse | LedgerTaskResponse,
  ) => {
    received: LedgerFetchedAddressData[];
    options: {
      accountIndices: number[];
    };
  };
}
