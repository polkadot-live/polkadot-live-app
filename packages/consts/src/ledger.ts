// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  LedgerDeviceID,
  LedgerDeviceMeta,
  LedgerErrorMeta,
  LedgerErrorStatusCode,
} from '@polkadot-live/types';

export const TX_METADATA_SRV_URL =
  'https://api.zondax.ch/polkadot/transaction/metadata';

export const ledgerUSBVendorId = 0x2c97;

export const ledgerDevices: Record<LedgerDeviceID, LedgerDeviceMeta> = {
  blue: {
    deviceId: 'blue',
    legacyUsbProductId: 0x0000,
    productIdMM: 0x00,
    productName: 'Ledger Blue',
  },
  nanoS: {
    deviceId: 'nanoS',
    legacyUsbProductId: 0x0001,
    productIdMM: 0x10,
    productName: 'Ledger Nano S',
  },
  nanoX: {
    deviceId: 'nanoX',
    legacyUsbProductId: 0x0004,
    productIdMM: 0x40,
    productName: 'Ledger Nano X',
  },
  nanoSP: {
    deviceId: 'nanoSP',
    legacyUsbProductId: 0x0005,
    productIdMM: 0x50,
    productName: 'Ledger Nano S Plus',
  },
  stax: {
    deviceId: 'stax',
    legacyUsbProductId: 0x0006,
    productIdMM: 0x60,
    productName: 'Ledger Stax',
  },
  europa: {
    deviceId: 'europa',
    legacyUsbProductId: 0x0007,
    productIdMM: 0x70,
    productName: 'Ledger Flex',
  },
};

export const ledgerErrorMeta: Record<LedgerErrorStatusCode, LedgerErrorMeta> = {
  AppNotOpen: {
    ack: 'failure',
    statusCode: 'AppNotOpen',
    body: { msg: 'Required Ledger app is not open' },
  },
  DeviceLocked: {
    ack: 'failure',
    statusCode: 'DeviceLocked',
    body: { msg: 'No supported Ledger device connected.' },
  },
  DeviceNotConnected: {
    ack: 'failure',
    statusCode: 'DeviceNotConnected',
    body: { msg: 'No supported Ledger device connected.' },
  },
  TransportUndefined: {
    ack: 'failure',
    statusCode: 'TransportUndefined',
    body: { msg: 'Problem with USB module.' },
  },
};
