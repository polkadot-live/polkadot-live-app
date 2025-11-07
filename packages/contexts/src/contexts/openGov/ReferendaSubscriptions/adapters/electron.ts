// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReferendaSubscriptionsAdapter } from './types';

export const electronAdapter: ReferendaSubscriptionsAdapter = {
  fetchOnMount: async () => null,
  listenOnMount: () => null,
};
