// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { planckToUnit, rmCommas } from '@w3ux/utils';
import { chainCurrency, chainUnits } from '@ren/config/chains';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  SubscriptionTask,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';

/**
 * @name getTooltipClassForGroup
 * @summary Utility to determine if a tooltip should be rendered over a subscription switch.
 * For subscription tasks associated with an account.
 */
export const showGroupTooltip = (task: SubscriptionTask) => {
  const { account, category } = task;
  if (!account) {
    return false;
  }

  switch (category) {
    case 'Nomination Pools': {
      return account.nominationPoolData ? false : true;
    }
    case 'Nominating': {
      return account.nominatingData ? false : true;
    }
    default: {
      return false;
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
      return 'Not Nominating';
    }
    case 'Nomination Pools': {
      return 'Not In Nomination Pool';
    }
    default: {
      return '';
    }
  }
};

/**
 * @name getShortIntervalLabel
 * @summary Utility for getting shortened text for an interval setting.
 */
export const getShortIntervalLabel = (ticksToWait: number) => {
  switch (ticksToWait) {
    case 1:
      return '15 mins';
    case 2:
      return '30 mins';
    case 4:
      return '60 mins';
    case 8:
      return '2 hrs';
    case 16:
      return '4 hrs';
    case 24:
      return '6 hrs';
    case 48:
      return '12 hrs';
    case 96:
      return '24 hrs';
    default:
      return '';
  }
};

/**
 * @name formatChainUnits
 * @summary Get readable chain units for rendering.
 */
export const formatChainUnits = (units: string, chainId: ChainID) => {
  // Include regex to remove trailing zeros after decimal point.
  const formatted: string = planckToUnit(
    new BigNumber(rmCommas(units)),
    chainUnits(chainId)
  )
    .toFixed(2)
    .replace(/(\.\d*?[1-9])0+|\.0*$/, '$1')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${formatted} ${chainCurrency(chainId)}`;
};
