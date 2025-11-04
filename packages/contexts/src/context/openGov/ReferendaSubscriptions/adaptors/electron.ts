// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReferendaSubscriptionsAdaptor } from './types';

export const electronAdapter: ReferendaSubscriptionsAdaptor = {
  fetchOnMount: async () => null,
  listenOnMount: () => null,
};
