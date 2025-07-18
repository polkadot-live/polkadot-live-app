// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { TX_METADATA_SRV_URL } from '@polkadot-live/consts/ledger';
import { getLedgerAppName } from '@polkadot-live/consts/chains';
import { MainDebug } from '@/utils/DebugUtils';
import { PolkadotGenericApp, supportedApps } from '@zondax/ledger-substrate';
import { USBController } from './controller';
import { withTimeout } from './utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  LedgerGetAddressData,
  LedgerResult,
  LedgerTask,
  LedgerTaskResult,
} from '@polkadot-live/types/ledger';

const debug = MainDebug.extend('Ledger');

/**
 * Connects to a Ledger device to perform a task.
 */
export const executeLedgerTask = async (
  chainId: string,
  tasks: LedgerTask[],
  options: { accountIndices: number[] }
): Promise<LedgerTaskResult> => {
  if (tasks.includes('get_address')) {
    debug('🔷 Get address');
    return await handleGetAddresses(chainId, options.accountIndices);
  } else {
    const error = new Error('Error: Unrecognized Ledger task.');
    return { success: false, error };
  }
};

/**
 * Gets addresses on the device.
 */
export const handleGetAddresses = async (
  chainName: string,
  indices: number[]
): Promise<LedgerTaskResult> => {
  try {
    const transport = USBController.getTransport();
    if (!transport) {
      return USBController.getLedgerError('TransportUndefined');
    }

    // Get ss58 address prefix for requested chain.
    const appName = getLedgerAppName(chainName as ChainID);
    const { ss58_addr_type: ss58prefix } = supportedApps.find(
      (app) => app.name === appName
    )!;

    // Get the correct `coin_type` for the address derivation path.
    //const slip = chainName === 'Polkadot Relay' ? '354' : '434';
    const slip = '354';

    // Get the correct chain name for the metadata API.
    const chainId = chainName === 'Polkadot Relay' ? 'dot' : 'ksm';

    // Establish connection to Ledger Polkadot app.
    const substrateApp = new PolkadotGenericApp(
      transport,
      chainId,
      TX_METADATA_SRV_URL
    );

    // Get Ledger model information.
    const { deviceModel } = transport;
    const { id, productName } = deviceModel || {};
    debug('🔷 New Substrate app. Id: %o Product name: %o', id, productName);

    const results: LedgerResult[] = [];
    let maybeError: Error | null = null;

    for (const index of indices) {
      const PATH = `m/44'/${slip}'/${index}'/0'/0'`;
      const result: LedgerGetAddressData | Error = await withTimeout(
        3000,
        substrateApp.getAddress(PATH, ss58prefix, false)
      );

      if (result instanceof Error) {
        maybeError = result;
        break;
      }

      results.push({
        device: { id, productName },
        body: result, // { pubKey, address }
      });
    }

    return !maybeError
      ? { success: true, results: JSON.stringify(results) }
      : { success: false, error: maybeError };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};
