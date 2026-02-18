// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { encoders } from './registry';
import type { AnyData } from '@polkadot-live/types';
import type { EncodeContext, EncodedValue } from './types';

const DEFAULT_LABEL = 'Unknown';

export function encodeValue(
  value: unknown,
  options: EncodeContext,
): EncodedValue {
  for (const { guard, encoder } of encoders) {
    if (guard(value)) {
      return {
        tag: encoder.tag,
        label: options.label ?? DEFAULT_LABEL,
        value: encoder.encode(value, options),
      };
    }
  }

  // Fallback.
  return {
    tag: 'Unknown',
    label: options.label ?? DEFAULT_LABEL,
    value: String(value),
  };
}

export const encodeRecord = (rec: Record<string, AnyData>): EncodedValue[] =>
  Object.entries(rec).map(([label, data]) =>
    encodeValue(data[0], data[1] ? { ...data[1], label } : { label }),
  );
