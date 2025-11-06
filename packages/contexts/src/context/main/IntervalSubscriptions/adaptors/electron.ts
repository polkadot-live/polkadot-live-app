// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscriptionsAdaptor } from './types';

export const electronAdapter: IntervalSubscriptionsAdaptor = {
  listenOnMount: () => null,

  onMount: () => {
    /* empty */
  },

  onRemoveInterval: () => {
    /* empty */
  },
};
