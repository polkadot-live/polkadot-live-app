// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Manage } from './Manage';
import type { ImportReadOnlyProps } from './types';

export const ImportReadOnly = ({ setSection }: ImportReadOnlyProps) => (
  <Manage setSection={setSection} />
);
