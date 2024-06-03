// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubscriptionTask, TaskCategory } from '@/types/subscriptions';

/**
 * @name getTooltipClassForGroup
 * @summary Utility to determine if a tooltip should be rendered over a subscription switch.
 * For subscription tasks associated with an account.
 */
export const getTooltipClassForGroup = (task: SubscriptionTask) => {
  const { account, category } = task;
  if (!account) {
    return '';
  }

  switch (category) {
    case 'Nomination Pools': {
      return account.nominationPoolData ? '' : 'tooltip-trigger-element';
    }
    case 'Nominating': {
      return account.nominatingData ? '' : 'tooltip-trigger-element';
    }
    default: {
      return '';
    }
  }
};

/**
 * @name toolTipTextFor
 * @summary Utility for fetching tooltip text for a subscription switch.
 * For subscrption tasks associated with an account.
 */
export const toolTipTextFor = (category: TaskCategory) => {
  switch (category) {
    case 'Nominating': {
      return 'Not nominating.';
    }
    case 'Nomination Pools': {
      return 'Not in nomination pool.';
    }
    default: {
      return '';
    }
  }
};
