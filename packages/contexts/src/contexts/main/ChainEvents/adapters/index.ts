// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chromeAdapter } from './chrome';
import { electronAdapter } from './electron';

export const getChainEventAdapter = () =>
  'myAPI' in window ? electronAdapter : chromeAdapter;
