// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { withTimeout } from '@w3ux/utils';
import { PolkadotGenericApp } from '@zondax/ledger-substrate';
import { Buffer } from 'buffer';
import { u8aToHex } from 'dedot/utils';
import type { LedgerTaskResult } from '@polkadot-live/types/ledger';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ResponseVersion } from '@zondax/ledger-js';
import type { GenericeResponseAddress } from '@zondax/ledger-substrate/dist/common';
import type { HexString } from 'dedot/utils';

export class LedgerController {
  // The ledger device transport. `null` when not actively in use
  static transport: AnyData | null;

  // Whether the device is currently paired
  static isPaired = false;

  // Initialize the app and return device info.
  static initialize = async () => {
    this.transport = await TransportWebHID.create();
    const app = new PolkadotGenericApp(this.transport);
    const { deviceModel } = this.transport;
    return { app, deviceModel };
  };

  // Ensure transport is closed.
  static ensureClosed = async () => {
    if (this.transport?.device?.opend) {
      await this.transport?.close();
    }
  };

  // Ensure transport is open.
  static ensureOpen = async () => {
    if (!this.transport?.device?.opened) {
      await this.transport?.open();
    }
  };

  // Gets device runtime version.
  static getVersion = async (app: PolkadotGenericApp) => {
    await this.ensureOpen();
    const result = (await withTimeout(3000, app.getVersion(), {
      onTimeout: async () => await this.transport?.close(),
    })) as ResponseVersion;
    await this.ensureClosed();
    return result;
  };

  // Gets an address from transport.
  static getAddress = async (
    app: PolkadotGenericApp,
    index: number,
    ss58Prefix: number,
  ): Promise<GenericeResponseAddress> => {
    await this.ensureOpen();
    const bip42Path = `m/44'/354'/${index}'/${0}'/${0}'`;
    const result = (await withTimeout(
      3000,
      app.getAddressEd25519(bip42Path, ss58Prefix, false),
      {
        onTimeout: () => this.transport?.close(),
      },
    )) as GenericeResponseAddress;
    await this.ensureClosed();
    return result;
  };

  // Signs a payload on device.
  static signPayload = async (
    app: PolkadotGenericApp,
    index: number,
    payload: Uint8Array,
    txMetadata: Uint8Array,
  ): Promise<LedgerTaskResult> => {
    try {
      await this.ensureOpen();
      const bip42Path = `m/44'/354'/${index}'/${0}'/${0}'`;
      const toSign = Buffer.from(payload);
      const buff = Buffer.from(txMetadata);
      const { signature: sig } = await app.signWithMetadataEd25519(
        bip42Path,
        toSign,
        buff,
      );
      const signatureHex: HexString = u8aToHex(
        new Uint8Array(sig.buffer, sig.byteOffset, sig.byteLength),
      );
      await this.ensureClosed();
      return { success: true, results: signatureHex };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Reset ledger on unmount.
  static unmount = async () => {
    await this.transport?.close();
    this.transport = null;
    this.isPaired = false;
  };
}
