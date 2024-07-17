// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MainDebug } from '@/utils/DebugUtils';
import type { AnyFunction, AnyJson } from '@/types/misc';
import type { BrowserWindow } from 'electron';
import type { LedgerGetAddressResult, LedgerTask } from '@/types/ledger';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import type Transport from '@ledgerhq/hw-transport';
import { PolkadotGenericApp, supportedApps } from '@zondax/ledger-substrate';

const debug = MainDebug.extend('Ledger');

const CHAIN_ID = 'polkadot';
const TX_METADATA_SRV_URL =
  'https://api.zondax.ch/polkadot/transaction/metadata';

// Handle Ledger connection errors.
const handleErrors = (window: BrowserWindow, err: AnyJson) => {
  // Attempt to handle the error while the window still exists.
  try {
    const errStr = String(err);

    if (errStr.startsWith('TypeError: cannot open device with path')) {
      window.webContents.send(
        'renderer:ledger:report:status',
        JSON.stringify({
          ack: 'failure',
          statusCode: 'DeviceNotConnected',
          body: { msg: 'No supported Ledger device connected.' },
        })
      );
    } else if (errStr.startsWith('Error: LockedDeviceError')) {
      window.webContents.send(
        'renderer:ledger:report:status',
        JSON.stringify({
          ack: 'failure',
          statusCode: 'DeviceLocked',
          body: { msg: 'No supported Ledger device connected.' },
        })
      );
    } else {
      // handle other errors with a provided id.
      switch (err?.id) {
        case 'NoDevice':
          window.webContents.send(
            'renderer:ledger:report:status',
            JSON.stringify({
              ack: 'failure',
              statusCode: 'DeviceNotConnected',
              body: { msg: 'No supported Ledger device connected.' },
            })
          );
          break;
        default:
          window.webContents.send(
            'renderer:ledger:report:status',
            JSON.stringify({
              ack: 'failure',
              statusCode: 'AppNotOpen',
              body: { msg: 'Required Ledger app is not open' },
            })
          );
      }
    }
  } catch (e) {
    // window has been closed. exit process.
    return;
  }
};

// Connects to a Ledger device to perform a task.
export const executeLedgerLoop = async (
  window: BrowserWindow,
  chainName: string,
  tasks: LedgerTask[],
  options?: AnyJson
) => {
  try {
    if (tasks.includes('get_address')) {
      debug('🔷 Get address');

      const result = await handleGetAddress(
        window,
        chainName,
        options.accountIndex ?? 0
      );

      if (result) {
        window.webContents.send(
          'renderer:ledger:report:status',
          JSON.stringify({
            ack: 'success',
            options,
            ...result,
          })
        );
      }
    }
  } catch (err) {
    handleErrors(window, err);
  }
};

// Gets a Polkadot addresses on the device.
export const handleGetAddress = async (
  window: BrowserWindow,
  chainName: string,
  index: number
) => {
  try {
    // Forge transpiles to CJS, requiring us to add `.default` on `TransportNodeHid`.
    const transport: Transport = await (
      TransportNodeHid as AnyFunction
    ).default.create(1000, 1000);

    // Get ss58 address prefix for requested chain.
    const { ss58_addr_type: ss58prefix } =
      supportedApps.find((app) => app.name === chainName) || {};

    if (ss58prefix === undefined) {
      transport.close();
      throw new Error(`SS58 prefix undefined for chain: ${chainName}`);
    }

    // Establish connection to Ledger Polkadot app.
    const substrateApp = new PolkadotGenericApp(
      transport,
      CHAIN_ID,
      TX_METADATA_SRV_URL
    );

    // Get Ledger model information.
    const { deviceModel } = transport;
    const { id, productName } = deviceModel || {};
    debug('🔷 New Substrate app. Id: %o Product name: %o', id, productName);

    // Send in progress message to window.
    window.webContents.send(
      'renderer:ledger:report:status',
      JSON.stringify({
        ack: 'success',
        statusCode: 'GettingAddress',
        body: `Getting addresess ${index} in progress.`,
      })
    );

    // Timeout function for hanging tasks. Used for tasks that require no input from the device, such
    // as getting an address that does not require confirmation.
    const withTimeout = async (
      millis: number,
      promise: Promise<AnyFunction>
    ) => {
      const timeout = new Promise((_, reject) =>
        setTimeout(async () => {
          transport.close();
          reject(Error('Timeout'));
        }, millis)
      );
      return Promise.race([promise, timeout]);
    };

    const PATH = `m/44'/354'/${index}'/0'/0'`;
    const result: LedgerGetAddressResult | Error = await withTimeout(
      3000,
      substrateApp.getAddress(PATH, ss58prefix, false)
    );

    transport.close();

    if (result instanceof Error) {
      throw result;
    } else {
      return {
        statusCode: 'ReceivedAddress',
        device: { id, productName },
        body: [result], // { pubKey, address }
      };
    }
  } catch (err) {
    console.log(JSON.stringify(err));
    console.log(err);
    return null;
  }
};
