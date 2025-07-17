// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getLedgerAppName } from '@polkadot-live/consts/chains';
import { MainDebug } from '@/utils/DebugUtils';
import { PolkadotGenericApp, supportedApps } from '@zondax/ledger-substrate';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import type { AnyFunction } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  LedgerGetAddressData,
  LedgerResult,
  LedgerTask,
  LedgerTaskResult,
} from '@polkadot-live/types/ledger';
import type Transport from '@ledgerhq/hw-transport';

const debug = MainDebug.extend('Ledger');

const TX_METADATA_SRV_URL =
  'https://api.zondax.ch/polkadot/transaction/metadata';

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
 * Timeout function for hanging tasks. Used for tasks that require no input from the device, such
 * as getting an address that does not require confirmation.
 */
const withTimeout = async (
  millis: number,
  promise: Promise<AnyFunction>,
  transport?: Transport
) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(async () => {
      if (transport !== undefined) {
        await transport.close();
      }
      reject(Error('Timeout'));
    }, millis)
  );
  return Promise.race([promise, timeout]);
};

/**
 * Gets addresses on the device.
 */
export const handleGetAddresses = async (
  chainName: string,
  indices: number[]
): Promise<LedgerTaskResult> => {
  try {
    // Main transpiles to CJS, requiring us to add `.default` on `TransportNodeHid`.
    const promise = (TransportNodeHid as AnyFunction).default.create();
    const transport: Transport | Error = await withTimeout(3000, promise);

    if (transport instanceof Error) {
      const error = new Error("Couldn't connect to ledger.");
      return { success: false, error };
    }

    // Get ss58 address prefix for requested chain.
    const appName = getLedgerAppName(chainName as ChainID);
    const { ss58_addr_type: ss58prefix } = supportedApps.find(
      (app) => app.name === appName
    )!;

    if (ss58prefix === undefined) {
      transport.close();
      const error = new Error(`SS58 prefix undefined for chain: ${chainName}`);
      return { success: false, error };
    }

    // Get the correct `coin_type` for the address derivation path.
    //const slip = chainName === 'Polkadot Relay' ? '354' : '434';
    const slip = '354';

    // Get the correct chain ID for the metadata API.
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
    const maybeError: { flag: boolean; error?: Error } = { flag: false };

    for (const index of indices) {
      const PATH = `m/44'/${slip}'/${index}'/0'/0'`;
      const result: LedgerGetAddressData | Error = await withTimeout(
        3000,
        substrateApp.getAddress(PATH, ss58prefix, false),
        transport
      );

      if (result instanceof Error) {
        maybeError.flag = true;
        maybeError.error = result;
        break;
      }

      results.push({
        device: { id, productName },
        body: result, // { pubKey, address }
      });
    }

    await transport.close();

    if (maybeError.flag) {
      const { error } = maybeError;
      return { success: false, error };
    } else {
      return { success: true, results: JSON.stringify(results) };
    }
  } catch (error) {
    return { success: false, error: error as Error };
  }
};

/***
 * Handle Ledger connection errors.
 */
export const handleLedgerTaskError = (err: Error): string => {
  // Handle thrown error when connecting Ledger device **after** opening the Accounts view.
  // Requires the user to close and re-open the Accounts view.
  if (
    err.message.startsWith('cannot open device with path') &&
    err.name === 'TypeError'
  ) {
    return JSON.stringify({
      ack: 'failure',
      statusCode: 'TypeError',
      body: { msg: 'Problem with USB module.' },
    });
  }

  // Attempt to handle the error while the window still exists.
  // Check `errorMessage` property on error object.
  if ('errorMessage' in err) {
    switch (err.errorMessage) {
      // Handle ledger device locked.
      case 'Device Locked': {
        return JSON.stringify({
          ack: 'failure',
          statusCode: 'DeviceLocked',
          body: { msg: 'No supported Ledger device connected.' },
        });
      }

      // Handle ledger app not open.
      case 'App does not seem to be open': {
        return JSON.stringify({
          ack: 'failure',
          statusCode: 'AppNotOpen',
          body: { msg: 'Required Ledger app is not open' },
        });
      }
    }
  }

  // Check `id` property on error object.
  if ('id' in err) {
    switch (err.id) {
      case 'ListenTimeout': {
        return JSON.stringify({
          ack: 'failure',
          statusCode: 'DeviceNotConnected',
          body: { msg: 'No supported Ledger device connected.' },
        });
      }
    }
  }

  // Send default error status.
  return JSON.stringify({
    ack: 'failure',
    statusCode: 'DeviceNotConnected',
    body: { msg: 'No supported Ledger device connected.' },
  });
};
