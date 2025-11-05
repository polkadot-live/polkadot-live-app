// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SubscriptionsController } from '@polkadot-live/core';
import type { ManageAdaptor } from './types';

export const electronAdapter: ManageAdaptor = {
  onMount: (setRenderedSubscriptions) => {
    SubscriptionsController.setRenderedSubscriptionsState =
      setRenderedSubscriptions;
    return null;
  },
};
