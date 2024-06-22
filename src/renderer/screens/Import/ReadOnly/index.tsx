// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Manage } from './Manage';
import type { AnyFunction } from '@w3ux/utils/types';

export const ImportReadOnly = ({
  setSection,
}: {
  section: number;
  setSection: AnyFunction;
}) => <Manage setSection={setSection} />;
