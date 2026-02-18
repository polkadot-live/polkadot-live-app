// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@polkadot-live/types';

export interface ReferendaSubscriptionsAdapter {
  fetchOnMount: () => Promise<IntervalSubscription[] | null>;
  listenOnMount: (
    addReferendaSubscription?: (task: IntervalSubscription) => void,
    removeReferendaSubscription?: (task: IntervalSubscription) => void,
    updateReferendaSubscription?: (task: IntervalSubscription) => void,
  ) => (() => void) | null;
}
