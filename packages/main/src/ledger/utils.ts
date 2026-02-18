// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ledgerDevices, ledgerUSBVendorId } from '@polkadot-live/consts/ledger';
import type { AnyFunction } from '@polkadot-live/types/misc';

/**
 * @name verifyLedgerDevice
 * @summary Verifies if a USB device is a Ledger device based on its vendor and product ID.
 */
export const verifyLedgerDevice = (
  vendorId: number,
  productId: number,
): boolean => {
  if (vendorId !== ledgerUSBVendorId) {
    return false;
  } else {
    return verifyProductId(productId);
  }
};

/**
 * @name verifyProductId
 * @summary Verifies if the given productId matches any valid Ledger device product ID.
 */
export const verifyProductId = (productId: number): boolean => {
  const devicesList = Object.values(ledgerDevices);
  const legacy = devicesList.find(
    ({ legacyUsbProductId }) => legacyUsbProductId === productId,
  );

  if (legacy !== undefined) {
    return true;
  }

  const mm = productId >> 8;
  return !!devicesList.find(({ productIdMM }) => productIdMM === mm);
};

/**
 * @name withTimeout
 * @summary Timeout function for hanging tasks. Used for tasks that require no input from the device, such as getting an address that does not require confirmation.
 */
export const withTimeout = async (
  millis: number,
  promise: Promise<AnyFunction>,
) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => {
      const error = new Error('Timeout');
      error.name = 'Timeout';
      reject(error);
    }, millis),
  );
  return Promise.race([promise, timeout]);
};
