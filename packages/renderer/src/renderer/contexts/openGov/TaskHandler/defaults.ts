// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TaskHandlerContextInterface } from './types';

export const defaultTaskHandlerContext: TaskHandlerContextInterface = {
  addIntervalSubscription: (task, referendumInfo) => {},
  removeIntervalSubscription: (task, referendumInfo) => {},
  addAllIntervalSubscriptions: (tasks, referendumInfo) => {},
  removeAllIntervalSubscriptions: (tasks, referendumInfo) => {},
};
