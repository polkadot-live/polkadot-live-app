// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WrappedSubscriptionTasks } from '@polkadot-live/types';
import type { Dispatch, SetStateAction } from 'react';

export interface ManageAdapter {
  onMount: (
    setRenderedSubscriptions: Dispatch<
      SetStateAction<WrappedSubscriptionTasks>
    >,
  ) => (() => void) | null;
}
