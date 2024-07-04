// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getApiInstance } from '@/utils/ApiUtils';
import { Callbacks } from '.';
import type { ApiCallEntry, SubscriptionTask } from '@/types/subscriptions';

export const executeOneShot = async (task: SubscriptionTask) => {
  switch (task.action) {
    case 'subscribe:account:balance:free': {
      const result = await oneShot_account_balance_free(task);
      return result;
    }
    case 'subscribe:account:balance:frozen': {
      const result = await oneShot_account_balance_frozen(task);
      return result;
    }
    case 'subscribe:account:balance:reserved': {
      const result = await oneShot_account_balance_reserved(task);
      return result;
    }
    case 'subscribe:account:nominationPools:rewards': {
      const result = await oneShot_nomination_pool_rewards(task);
      return result;
    }
    case 'subscribe:account:nominationPools:state': {
      const result = await oneShot_nomination_pool_state(task);
      return result;
    }
    case 'subscribe:account:nominationPools:renamed': {
      const result = await oneShot_nomination_pool_renamed(task);
      return result;
    }
    case 'subscribe:account:nominationPools:roles': {
      const result = await oneShot_nomination_pool_roles(task);
      return result;
    }
    case 'subscribe:account:nominationPools:commission': {
      const result = await oneShot_nomination_pool_commission(task);
      return result;
    }
    case 'subscribe:account:nominating:pendingPayouts': {
      const result = await oneShot_nominating_pending_payouts(task);
      return result;
    }
    case 'subscribe:account:nominating:exposure': {
      const result = await oneShot_nominating_exposure(task);
      return result;
    }
    case 'subscribe:account:nominating:commission': {
      const result = await oneShot_nominating_commission(task);
      return result;
    }
    default: {
      return false;
    }
  }
};

/**
 * @name oneShot_account_balance_free
 * @summary One-shot call to fetch an account's free balance.
 */
const oneShot_account_balance_free = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const data = await api.query.system.account(task.account!.address);
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_account_balance_free(data, entry, true);
  return true;
};

/**
 * @name oneShot_account_balance_frozen
 * @summary One-shot to fetch an account's frozen balance.
 */
const oneShot_account_balance_frozen = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const data = await api.query.system.account(task.account!.address);
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_account_balance_frozen(data, entry, true);
  return true;
};

/**
 * @name oneShot_account_balance_reserved
 * @summary One-shot to fetch an account's reserved balance.
 */
const oneShot_account_balance_reserved = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const data = await api.query.system.account(task.account!.address);
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_account_balance_reserved(data, entry, true);
  return true;
};

/**
 * @name oneShot_nomination_pool_rewards
 * @summary One-shot call to fetch an account's nominating pool rewards.
 */
const oneShot_nomination_pool_rewards = async (task: SubscriptionTask) => {
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nomination_pool_rewards(entry, true);
  return true;
};

/**
 * @name oneShot_nomination_pool_state
 * @summary One-shot call to fetch an account's nominating pool state.
 */
const oneShot_nomination_pool_state = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const data = await api.query.nominationPools.bondedPools(task.actionArgs!);
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nomination_pool_state(data, entry, true);
  return true;
};

/**
 * @name oneShot_nomination_pool_renamed
 * @summary One-shot call to fetch an account's nominating pool name.
 */
const oneShot_nomination_pool_renamed = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const data = await api.query.nominationPools.metadata(task.actionArgs!);
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nomination_pool_renamed(data, entry, true);
  return true;
};

/**
 * @name oneShot_nomination_pool_roles
 * @summary One-shot call to fetch an account's nominating pool roles.
 */
const oneShot_nomination_pool_roles = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const data = await api.query.nominationPools.bondedPools(task.actionArgs!);
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nomination_pool_roles(data, entry, true);
  return true;
};

/**
 * @name oneShot_nomination_pool_commission
 * @summary One-shot call to fetch an account's nominating pool commission.
 */
const oneShot_nomination_pool_commission = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const data = await api.query.nominationPools.bondedPools(task.actionArgs!);
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nomination_pool_commission(data, entry, true);
  return true;
};

/**
 * @name oneShot_nominating_pending_payouts
 * @summary One-shot call to fetch an account's nominating pending paypouts.
 */
const oneShot_nominating_pending_payouts = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const data = await api.query.staking.activeEra();
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nominating_pending_payouts(data, entry, true);
  return true;
};

/**
 * @name oneShot_nominating_exposure
 * @summary One-shot call to fetch an account's nominating exposure.
 */
const oneShot_nominating_exposure = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const { chainId } = task;
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

  return true;
};

/**
 * @name oneShot_nominating_commission
 * @summary One-shot call to see a change in commission.
 */
const oneShot_nominating_commission = async (task: SubscriptionTask) => {
  const instance = await getApiInstance(task.chainId);
  if (!instance) {
    return false;
  }

  const { api } = instance;
  const data = await api.query.staking.activeEra();
  const entry: ApiCallEntry = { curVal: null, task };
  await Callbacks.callback_nominating_commission(data, entry, true);
  return true;
};
