// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { SubscriptionsContextInterface } from './types';

export const defaultSubscriptionsContext: SubscriptionsContextInterface = {
  chainSubscriptions: new Map(),
  accountSubscriptions: new Map(),
  setChainSubscriptions: () => {},
  getChainSubscriptions: () => [],
  setAccountSubscriptions: () => {},
  getAccountSubscriptions: () => [],
  updateTask: () => {},
};
