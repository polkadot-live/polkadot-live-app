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
import type Transport from '@ledgerhq/hw-transport';

const debug = MainDebug.extend('Ledger');

/**
 * Connects to a Ledger device to perform a task.
 */
export const executeLedgerTask = async (
  chainId: ChainID,
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
 * Instantiate a Polkadot generic app.
 */
export const getPolkadotGenericApp = (
  chainId: ChainID,
  transport: Transport
): { app: PolkadotGenericApp; ss58Prefix: number } => {
  // Get ss58 address prefix for requested chain.
  const appName = getLedgerAppName(chainId as ChainID);
  const { ss58_addr_type: ss58Prefix } = supportedApps.find(
    (app) => app.name === appName
  )!;

  // Get the correct chain name for the metadata API.
  const chainName = chainId === 'Polkadot Relay' ? 'dot' : 'ksm';

  // Establish connection to Ledger Polkadot app.
  const app = new PolkadotGenericApp(transport, chainName, TX_METADATA_SRV_URL);
  return { app, ss58Prefix };
};

/**
 * Signs a tx blob.
 */
export const signLedgerPayload = async (
  chainId: ChainID,
  index: number,
  blob: Uint8Array,
  proof: Uint8Array
): Promise<LedgerTaskResult> => {
  const transport = USBController.transport!;
  if (!transport) {
    return USBController.getLedgerError('TransportUndefined');
  }

  const txBlob = Buffer.from(blob);
  const txMeta = Buffer.from(proof);
  const bip42Path = `m/44'/354'/${index}'/0'/0'`;

  const { app } = getPolkadotGenericApp(chainId, transport);
  const { signature: buffer } = await app.signWithMetadataEd25519(
    bip42Path,
    txBlob,
    txMeta
  );

  const signature = new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength
  );

  return { success: true, results: signature };
};

/**
 * Gets addresses on the device.
 */
export const handleGetAddresses = async (
  chainId: ChainID,
  indices: number[]
): Promise<LedgerTaskResult> => {
  try {
    const transport = USBController.transport;
    if (!transport) {
      return USBController.getLedgerError('TransportUndefined');
    }

    // Establish connection to Ledger Polkadot app.
    const { app, ss58Prefix } = getPolkadotGenericApp(chainId, transport);
    const { deviceModel } = transport;
    const { id, productName } = deviceModel || {};
    debug('🔷 New Substrate app. Id: %o Product name: %o', id, productName);

    // Get the correct `coin_type` for the address derivation path.
    //const slip = chainName === 'Polkadot Relay' ? '354' : '434';
    const slip = '354';

    const results: LedgerResult[] = [];
    let maybeError: Error | null = null;

    for (const index of indices) {
      const PATH = `m/44'/${slip}'/${index}'/0'/0'`;
      const result: LedgerGetAddressData | Error = await withTimeout(
        3000,
        app.getAddressEd25519(PATH, ss58Prefix, false)
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
