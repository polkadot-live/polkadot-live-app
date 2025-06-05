// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import * as themeVariables from '@ren/theme/variables';
import type { ConnectionsContextInterface } from './types';

export const defaultConnectionsContext: ConnectionsContextInterface = {
  stateLoaded: false,
  cacheGet: () => false,
  getOnlineMode: () => true,
  getTheme: () => themeVariables.darkTheme,
};
