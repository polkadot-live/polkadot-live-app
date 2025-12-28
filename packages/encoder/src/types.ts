// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types';

export interface Encoder<T> {
  tag: EncoderTag;
  encode(value: T, ctx: EncodeContext): string;
}

export interface EncoderEntry<T = AnyData> {
  guard: (value: unknown) => value is T;
  encoder: Encoder<T>;
}

export interface EncodeContext {
  label: string;
  ss58Prefix?: number;
}

export type EncoderTag =
  | 'BigInt'
  | 'Boolean'
  | 'Number'
  | 'AccountId32'
  | 'Unknown';

export interface EncodedValue {
  // Machine-readable type tag.
  tag: EncoderTag;
  // Human-readable label.
  label: string;
  // Serialized representation.
  value: string;
}
