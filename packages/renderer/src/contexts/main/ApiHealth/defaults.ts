// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-empty-function */

import type { ApiHealthContextInterface } from './types';

export const defaultApiHealthContext: ApiHealthContextInterface = {
  failedConnections: new Map(),
  hasConnectionIssue: () => false,
  onEndpointChange: () => new Promise(() => {}),
  setFailedConnections: () => {},
  startApi: () => new Promise(() => {}),
};
