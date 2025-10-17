// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { LedgerController } from '../../../controllers';
import { getLedgerAppName } from '@polkadot-live/consts/chains';
import { handleLedgerTaskError } from '@polkadot-live/core';
import { supportedApps } from '@zondax/ledger-substrate';
import type { ChainID } from '@polkadot-live/types/chains';
import type { LedgerFetchAddressResult } from './types';
import type {
  LedgerResult,
  LedgerTaskResponse,
} from '@polkadot-live/types/ledger';

/**
 * @name getLedgerAddresses
 * @summary Get ledger addresses.
 */
export const getLedgerAddresses = async (
  indices: number[],
  chainId: ChainID
): Promise<LedgerFetchAddressResult> => {
  try {
    const { app, deviceModel } = await LedgerController.initialize();
    const { id, productName } = deviceModel;
    const appName = getLedgerAppName(chainId as ChainID);
    const { ss58_addr_type: ss58Prefix } = supportedApps.find(
      (a) => a.name === appName
    )!;

    const results: LedgerResult[] = [];
    for (const index of indices) {
      const address = await LedgerController.getAddress(app, index, ss58Prefix);
      results.push({
        device: { id, productName },
        body: address,
      });
    }
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};

/**
 * @name getLedgerTaskResponse
 * @summary Get task response object from fetched address data.
 */
export const getLedgerTaskResponse = (
  result: LedgerFetchAddressResult,
  accountIndices: number[]
): LedgerTaskResponse => {
  if (result.success) {
    return {
      ack: 'success',
      statusCode: 'ReceiveAddress',
      payload: {
        options: { accountIndices },
        addresses: result.results!,
      },
    };
  } else {
    return handleLedgerTaskError(result.error!);
  }
};
