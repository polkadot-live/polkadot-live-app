// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, SetStateAction } from 'react';
import type { WrappedSubscriptionTasks } from '@polkadot-live/types';

export interface ManageAdaptor {
  onMount: (
    setRenderedSubscriptions: Dispatch<SetStateAction<WrappedSubscriptionTasks>>
  ) => (() => void) | null;
}
