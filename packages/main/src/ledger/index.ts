// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getLedgerAppName } from '@polkadot-live/consts/chains';
import { MainDebug } from '@/utils/DebugUtils';
import { PolkadotGenericApp, supportedApps } from '@zondax/ledger-substrate';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import type { AnyData, AnyFunction, AnyJson } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  LedgerGetAddressResult,
  LedgerTask,
} from '@polkadot-live/types/ledger';
import type Transport from '@ledgerhq/hw-transport';
import type { WebContentsView } from 'electron';

const debug = MainDebug.extend('Ledger');

const TX_METADATA_SRV_URL =
  'https://api.zondax.ch/polkadot/transaction/metadata';

/// Connects to a Ledger device to perform a task.
export const executeLedgerTask = async (
  view: WebContentsView,
  chainName: string,
  tasks: LedgerTask[],
  options: { accountIndices: number[] }
) => {
  try {
    if (tasks.includes('get_address')) {
      debug('🔷 Get address');

      const result = await handleGetAddresses(
        chainName,
        options.accountIndices
      );

      if (result) {
        view.webContents.send(
          'renderer:ledger:report:status',
          JSON.stringify({
            ack: 'success',
            statusCode: 'ReceiveAddress',
            options,
            addresses: result,
          })
        );
      }
    }
  } catch (error) {
    handleErrors(view, error);
  }
};

/// Gets a Polkadot addresses on the device.
export const handleGetAddresses = async (
  chainName: string,
  indices: number[]
) => {
  // Timeout function for hanging tasks. Used for tasks that require no input from the device, such
  // as getting an address that does not require confirmation.
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

  // Main transpiles to CJS, requiring us to add `.default` on `TransportNodeHid`.
  const promise = (TransportNodeHid as AnyFunction).default.create();
  const transport: Transport | Error = await withTimeout(3000, promise);

  if (transport instanceof Error) {
    throw new Error("Couldn't connect to ledger.");
  }

  // Get ss58 address prefix for requested chain.
  const appName = getLedgerAppName(chainName as ChainID);
  const { ss58_addr_type: ss58prefix } = supportedApps.find(
    (app) => app.name === appName
  )!;

  if (ss58prefix === undefined) {
    transport.close();
    throw new Error(`SS58 prefix undefined for chain: ${chainName}`);
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

  const results: AnyData[] = [];
  let error: { flag: boolean; obj: Error | null } = { flag: false, obj: null };

  for (const index of indices) {
    const PATH = `m/44'/${slip}'/${index}'/0'/0'`;
    const result: LedgerGetAddressResult | Error = await withTimeout(
      3000,
      substrateApp.getAddress(PATH, ss58prefix, false),
      transport
    );

    if (result instanceof Error) {
      error = { flag: true, obj: result };
      break;
    } else {
      results.push({
        device: { id, productName },
        body: [result], // { pubKey, address }
      });
    }
  }

  await transport.close();

  if (error.flag) {
    throw error.obj;
  } else {
    return JSON.stringify(results);
  }
};

/// Handle Ledger connection errors.
const handleErrors = (view: WebContentsView, err: AnyJson): void => {
  // Attempt to handle the error while the window still exists.
  try {
    let errorFound = false;

    // Check `errorMessage` property on error object.
    if ('errorMessage' in err) {
      switch (err.errorMessage) {
        // Handle ledger device locked.
        case 'Device Locked': {
          errorFound = true;
          view.webContents.send(
            'renderer:ledger:report:status',
            JSON.stringify({
              ack: 'failure',
              statusCode: 'DeviceLocked',
              body: { msg: 'No supported Ledger device connected.' },
            })
          );
          break;
        }

        // Handle ledger app not open.
        case 'App does not seem to be open': {
          errorFound = true;
          view.webContents.send(
            'renderer:ledger:report:status',
            JSON.stringify({
              ack: 'failure',
              statusCode: 'AppNotOpen',
              body: { msg: 'Required Ledger app is not open' },
            })
          );
          break;
        }
      }
    }
    // Check `id` property on error object.
    else if (!errorFound && 'id' in err) {
      switch (err.id) {
        case 'ListenTimeout': {
          errorFound = true;
          view.webContents.send(
            'renderer:ledger:report:status',
            JSON.stringify({
              ack: 'failure',
              statusCode: 'DeviceNotConnected',
              body: { msg: 'No supported Ledger device connected.' },
            })
          );
          break;
        }
      }
    }
    // Send default error status.
    else if (!errorFound) {
      view.webContents.send(
        'renderer:ledger:report:status',
        JSON.stringify({
          ack: 'failure',
          statusCode: 'DeviceNotConnected',
          body: { msg: 'No supported Ledger device connected.' },
        })
      );
    }
  } catch (e) {
    // window has been closed. exit process.
    return;
  }
};
