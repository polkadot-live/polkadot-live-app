// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { usb } from 'usb';
import { verifyLedgerDevice, withTimeout } from './utils';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import type { AnyFunction } from '@polkadot-live/types/misc';
import type { LedgerErrorType, LedgerTaskResult } from '@polkadot-live/types';
import type Transport from '@ledgerhq/hw-transport';

const genericErrorMsg = 'Generic error.';

/**
 * Add delay between closing and initializing the transport.
 * Give the OS time to release resources and fully close transport.
 */
const DELAY = 100;

export class USBController {
  static transport: Transport | null = null;

  /**
   * Initialize USB listeners.
   *
   * The `attach` and `detach` events are invoked in certain scenarios.
   * `attach` invoked when Ledger device is unlocked.
   * `detach` invoked when Ledger device is disconnected.
   * `detach` + `attach` invoked when opening and closing the Polkadot app.
   */
  static initialize = async () => {
    await this.checkAttachedDevices();

    usb.on('attach', async (device) => {
      const { idVendor, idProduct } = device.deviceDescriptor;
      if (verifyLedgerDevice(idVendor, idProduct)) {
        await new Promise((resolve) => setTimeout(resolve, DELAY));
        await this.initializeTransport();
      }
    });

    usb.on('detach', async () => {
      await this.closeTransport();
    });
  };

  /**
   * Initialize transport if any Ledger devices connected.
   */
  private static checkAttachedDevices = async () => {
    for (const device of usb.getDeviceList()) {
      const { idVendor, idProduct } = device.deviceDescriptor;

      if (verifyLedgerDevice(idVendor, idProduct)) {
        await this.closeTransport();
        await new Promise((resolve) => setTimeout(resolve, DELAY));
        await this.initializeTransport();
        break;
      }
    }
  };

  /**
   * Initialize transport.
   */
  private static initializeTransport = async () => {
    try {
      const promise = (TransportNodeHid as AnyFunction).default.create();
      const transport: Transport | Error = await withTimeout(3000, promise);
      if (transport instanceof Error) {
        throw transport;
      }

      this.transport = transport;
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Close transport.
   */
  private static closeTransport = async () => {
    if (this.transport !== null) {
      await this.transport.close();
      this.transport = null;
    }
  };

  /**
   * Get transport error.
   */
  static getLedgerError = (errorType: LedgerErrorType): LedgerTaskResult => {
    const error = new Error(genericErrorMsg);
    error.name = errorType;
    return { success: false, error };
  };
}
