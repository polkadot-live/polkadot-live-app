// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import { newSubstrateApp } from '@zondax/ledger-substrate';
import { MainDebug } from '@/utils/DebugUtils';
import type { AnyFunction, AnyJson } from '@/types/misc';
import type { BrowserWindow } from 'electron';
import type { LedgerGetAddressResult, LedgerTask } from '@/types/ledger';
// import { listen } from "@ledgerhq/logs";

const debug = MainDebug.extend('Ledger');

export const TOTAL_ALLOWED_STATUS_CODES = 50;
export const LEDGER_DEFAULT_ACCOUNT = 0x80000000;
export const LEDGER_DEFAULT_CHANGE = 0x80000000;
export const LEDGER_DEFAULT_INDEX = 0x80000000;

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
  appName: string,
  tasks: LedgerTask[],
  options?: AnyJson
) => {
  let transport;
  try {
    transport = await TransportNodeHid.open('');
    let result = null;

    if (tasks.includes('get_address')) {
      debug('🔷 Get address');

      result = await handleGetAddress(
        window,
        appName,
        transport,
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

    transport.close();
  } catch (err) {
    transport = null;
    handleErrors(window, err);
  }
};

// Gets a Polkadot addresses on the device.
export const handleGetAddress = async (
  window: BrowserWindow,
  appName: string,
  transport: TransportNodeHid,
  index: number
) => {
  const substrateApp = newSubstrateApp(transport, appName);
  const { deviceModel } = transport;
  const { id, productName } = deviceModel || {};

  debug('🔷 New Substrate app. Id: %o Product name: %o', id, productName);

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
  const withTimeout = async (millis: number, promise: Promise<AnyFunction>) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(async () => {
        transport?.device?.close();
        reject(Error('Timeout'));
      }, millis)
    );
    return Promise.race([promise, timeout]);
  };

  const result: LedgerGetAddressResult = await withTimeout(
    3000,
    substrateApp.getAddress(
      LEDGER_DEFAULT_ACCOUNT + index,
      LEDGER_DEFAULT_CHANGE,
      LEDGER_DEFAULT_INDEX + 0,
      false
    )
  );

  const error = result.error_message;
  if (error) {
    if (!error.startsWith('No errors')) {
      throw new Error(error);
    }
  }

  if (!(result instanceof Error)) {
    return {
      statusCode: 'ReceivedAddress',
      device: { id, productName },
      body: [result],
    };
  }
};
