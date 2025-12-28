// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FieldLayout } from './FieldLayout';
import type { FieldProps } from './types';

export const DefaultField = ({ label, value }: FieldProps) => (
  <FieldLayout label={label} value={value} />
);
