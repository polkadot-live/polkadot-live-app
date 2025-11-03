// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export const compare = (
  left: IntervalSubscription,
  right: IntervalSubscription
): boolean =>
  left.action === right.action &&
  left.chainId === right.chainId &&
  left.referendumId === right.referendumId
    ? true
    : false;
