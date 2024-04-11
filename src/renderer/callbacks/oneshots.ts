// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ApiCallEntry, SubscriptionTask } from '@/types/subscriptions';
import { getApiInstance } from '@/utils/ApiUtils';
import { Callbacks } from '.';

export const executeOneShot = async (task: SubscriptionTask) => {
  switch (task.action) {
    case 'subscribe:account:nominationPools:rewards': {
      await oneShot_nomination_pool_rewards(task);
      break;
    }
    case 'subscribe:account:nominationPools:state': {
      await oneShot_nomination_pool_state(task);
      break;
    }
    case 'subscribe:account:nominationPools:roles': {
      await oneShot_nomination_pool_roles(task);
      break;
    }
    case 'subscribe:account:nominating:pendingPayouts': {
      await oneShot_nominating_pending_payouts(task);
      break;
    }
    case 'subscribe:account:nominating:exposure': {
      await oneShot_nominating_exposure(task);
      break;
    }
    case 'subscribe:account:nominating:commission': {
      await oneShot_nominating_commission(task);
      break;
    }
    default: {
      break;
    }
  }
};

/**
 * @name oneShot_nomination_pool_rewards
 * @summary One-shot call to fetch an account's nominating pool rewards.
 */
const oneShot_nomination_pool_rewards = async (task: SubscriptionTask) => {
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nomination_pool_rewards(entry, true);
};

/**
 * @name oneShot_nomination_pool_state
 * @summary One-shot call to fetch an account's nominating pool state.
 */
const oneShot_nomination_pool_state = async (task: SubscriptionTask) => {
  const { api } = await getApiInstance(task.chainId);
  // eslint-disable-next-line prettier/prettier
  const data = await api.query.nominationPools.bondedPools(task.actionArgs || []);
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nomination_pool_state(data, entry, true);
};

/**
 * @name oneShot_nomination_pool_roles
 * @summary One-shot call to fetch an account's nominating pool roles.
 */
const oneShot_nomination_pool_roles = async (task: SubscriptionTask) => {
  const { api } = await getApiInstance(task.chainId);
  // eslint-disable-next-line prettier/prettier
  const data = await api.query.nominationPools.bondedPools(task.actionArgs || []);
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nomination_pool_roles(data, entry, true);
};

/**
 * @name oneShot_nominating_pending_payouts
 * @summary One-shot call to fetch an account's nominating pending paypouts.
 */
const oneShot_nominating_pending_payouts = async (task: SubscriptionTask) => {
  const { api } = await getApiInstance(task.chainId);
  const data = await api.query.staking.activeEra();
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nominating_pending_payouts(data, entry, true);
};

/**
 * @name oneShot_nominating_exposure
 * @summary One-shot call to fetch an account's nominating exposure.
 */
const oneShot_nominating_exposure = async (task: SubscriptionTask) => {
  const { chainId } = task;
  const { api } = await getApiInstance(chainId);
  const entry: ApiCallEntry = { curVal: null, task };
  const data = await api.query.staking.activeEra();

  switch (chainId) {
    case 'Polkadot':
    case 'Kusama': {
      await Callbacks.callback_nominating_exposure(data, entry, true);
      break;
    }
    case 'Westend': {
      await Callbacks.callback_nominating_exposure_westend(data, entry, true);
      break;
    }
  }
};

/**
 * @name oneShot_nominating_commission
 * @summary One-shot call to see a change in commission.
 */
const oneShot_nominating_commission = async (task: SubscriptionTask) => {
  const { api } = await getApiInstance(task.chainId);
  const data = await api.query.staking.activeEra();
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nominating_commission(data, entry, true);
};