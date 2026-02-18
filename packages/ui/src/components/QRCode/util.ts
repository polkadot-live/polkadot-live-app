// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { concatU8a, decodeAddress, hexToU8a } from '@dedot/utils';
import { CRYPTO_SR25519, SUBSTRATE_ID } from './constants';
import type { AnyData } from '@polkadot-live/types/misc';

const isString = (value: unknown): value is string => typeof value === 'string';

export const encodeNumber = (value: number): Uint8Array =>
  new Uint8Array([value >> 8, value & 0xff]);

export const encodeString = (value: string): Uint8Array => {
  const count = value.length;
  const u8a = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    u8a[i] = value.charCodeAt(i);
  }

  return u8a;
};

export const createSignPayload = (
  address: string,
  cmd: number,
  payload: Uint8Array,
  genesisHash: string | Uint8Array,
): Uint8Array => {
  try {
    const isUint8Array = (data: AnyData): data is Uint8Array =>
      data instanceof Uint8Array;

    const u8Payload = isUint8Array(payload) ? payload : new Uint8Array(payload);

    const u8GenesisHash = isString(genesisHash)
      ? hexToU8a(genesisHash)
      : genesisHash;

    return concatU8a(
      SUBSTRATE_ID,
      CRYPTO_SR25519,
      new Uint8Array([cmd]),
      decodeAddress(address),
      u8Payload,
      u8GenesisHash,
    );
  } catch (err) {
    console.error(err);
    return new Uint8Array();
  }
};

export const createImgSize = (
  size?: string | number,
): Record<string, string> => {
  if (!size) {
    return {
      height: 'auto',
      width: '100%',
    };
  }
  const width = isString(size) ? size : `${size}px`;
  return {
    height: 'auto',
    width,
  };
};
