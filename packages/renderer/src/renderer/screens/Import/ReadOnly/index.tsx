// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Manage } from './Manage';
import type { AnyFunction } from '@polkadot-live/types/misc';

export const ImportReadOnly = ({ setSection }: { setSection: AnyFunction }) => (
  <Manage setSection={setSection} />
);
