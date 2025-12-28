// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { EncodedValue } from '@polkadot-live/encoder';

export interface EncodedFieldProps {
  encoded: EncodedValue;
}

export interface FieldProps {
  label: string;
  value: string;
  children?: React.ReactNode;
}
