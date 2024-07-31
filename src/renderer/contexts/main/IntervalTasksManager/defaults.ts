// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { IntervalTasksManagerContextInterface } from './types';

export const defaultIntervalTasksManagerContext: IntervalTasksManagerContextInterface =
  {
    handleIntervalToggle: async () => await new Promise(() => {}),
    handleIntervalNativeCheckbox: async () => await new Promise(() => {}),
    handleRemoveIntervalSubscription: async () => await new Promise(() => {}),
  };
