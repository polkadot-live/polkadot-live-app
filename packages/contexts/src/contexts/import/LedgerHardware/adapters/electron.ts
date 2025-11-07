// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LedgerHardwareAdapter } from './types';
import type {
  GetAddressMessage,
  LedgerFetchedAddressData,
  SerLedgerTaskResponse,
} from '@polkadot-live/types';

export const electronAdapter: LedgerHardwareAdapter = {
  getLedgerAddresses: async (accountIndices, chainId) => {
    const serData = JSON.stringify({
      accountIndices,
      chainId,
    });
    // TODO: Handle JSON.parse exception.
    return await window.myAPI.doLedgerTask('get_address', serData);
  },

  handleFetchedAddressData: (response) => {
    const { serData } = response as SerLedgerTaskResponse;
    const { addresses, options }: GetAddressMessage = JSON.parse(serData!);
    const received: LedgerFetchedAddressData[] = JSON.parse(addresses);
    return { received, options };
  },
};
