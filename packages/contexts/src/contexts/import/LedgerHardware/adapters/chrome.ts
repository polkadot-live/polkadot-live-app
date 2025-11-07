// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getLedgerAddresses, getLedgerTaskResponse } from '../utils';
import type {
  LedgerFetchedAddressData,
  LedgerTaskResponse,
} from '@polkadot-live/types';
import type { LedgerHardwareAdapter } from './types';

export const chromeAdapter: LedgerHardwareAdapter = {
  getLedgerAddresses: async (accountIndices, chainId, controller) => {
    const result = await getLedgerAddresses(
      accountIndices,
      chainId,
      controller!
    );
    return getLedgerTaskResponse(result, accountIndices);
  },

  handleFetchedAddressData: (response) => {
    const { payload, statusCode } = response as LedgerTaskResponse;
    const { addresses, options } = payload!;
    const received: LedgerFetchedAddressData[] = addresses.map(
      ({ device, body }) => ({
        statusCode,
        device: { id: device.id!, productName: device.productName! },
        body,
      })
    );
    return { received, options };
  },
};
