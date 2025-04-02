// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '@ren/controller/APIsController';
import { Callbacks } from '.';
import type { Api } from '@ren/model/Api';
import type {
  ApiCallEntry,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';

export const executeOneShot = async (
  task: SubscriptionTask
): Promise<boolean> => {
  // Handle task that doesn't require an API instance.
  if (task.action === 'subscribe:account:nominationPools:rewards') {
    const result = await oneShot_nomination_pool_rewards(task);
    return result;
  }

  // Get API instance.
  const instance = await APIsController.getConnectedApi(task.chainId);
  if (!instance) {
    return false;
  }

  switch (task.action) {
    case 'subscribe:account:balance:free': {
      return await oneShot_account_balance_free(task, instance);
    }
    case 'subscribe:account:balance:frozen': {
      return await oneShot_account_balance_frozen(task, instance);
    }
    case 'subscribe:account:balance:reserved': {
      return await oneShot_account_balance_reserved(task, instance);
    }
    case 'subscribe:account:balance:spendable': {
      return await oneShot_account_balance_spendable(task, instance);
    }
    case 'subscribe:account:nominationPools:state': {
      return await oneShot_nomination_pool_state(task, instance);
    }
    case 'subscribe:account:nominationPools:renamed': {
      return await oneShot_nomination_pool_renamed(task, instance);
    }
    case 'subscribe:account:nominationPools:roles': {
      return await oneShot_nomination_pool_roles(task, instance);
    }
    case 'subscribe:account:nominationPools:commission': {
      return await oneShot_nomination_pool_commission(task, instance);
    }
    case 'subscribe:account:nominating:pendingPayouts': {
      return await oneShot_nominating_era_rewards(task, instance);
    }
    case 'subscribe:account:nominating:exposure': {
      return await oneShot_nominating_exposure(task, instance);
    }
    case 'subscribe:account:nominating:commission': {
      return await oneShot_nominating_commission(task, instance);
    }
    case 'subscribe:account:nominating:nominations': {
      return await oneShot_nominating_nominations(task, instance);
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
const oneShot_account_balance_free = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.system.account(task.account!.address);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_account_balance_free(data, entry, true);
};

/**
 * @name oneShot_account_balance_frozen
 * @summary One-shot to fetch an account's frozen balance.
 */
const oneShot_account_balance_frozen = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.system.account(task.account!.address);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_account_balance_frozen(data, entry, true);
};

/**
 * @name oneShot_account_balance_reserved
 * @summary One-shot to fetch an account's reserved balance.
 */
const oneShot_account_balance_reserved = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.system.account(task.account!.address);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_account_balance_reserved(data, entry, true);
};

/**
 * @name oneShot_account_balance_spendable
 * @summary One-shot to fetch an account's spendable balance.
 */
const oneShot_account_balance_spendable = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.system.account(task.account!.address);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_account_balance_spendable(data, entry, true);
};

/**
 * @name oneShot_nomination_pool_rewards
 * @summary One-shot call to fetch an account's nominating pool rewards.
 */
const oneShot_nomination_pool_rewards = async (
  task: SubscriptionTask
): Promise<boolean> => {
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_rewards(entry, true);
};

/**
 * @name oneShot_nomination_pool_state
 * @summary One-shot call to fetch an account's nominating pool state.
 */
const oneShot_nomination_pool_state = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.nominationPools.bondedPools(task.actionArgs!);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_state(data, entry, true);
};

/**
 * @name oneShot_nomination_pool_renamed
 * @summary One-shot call to fetch an account's nominating pool name.
 */
const oneShot_nomination_pool_renamed = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.nominationPools.metadata(task.actionArgs!);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_renamed(data, entry, true);
};

/**
 * @name oneShot_nomination_pool_roles
 * @summary One-shot call to fetch an account's nominating pool roles.
 */
const oneShot_nomination_pool_roles = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.nominationPools.bondedPools(task.actionArgs!);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_roles(data, entry, true);
};

/**
 * @name oneShot_nomination_pool_commission
 * @summary One-shot call to fetch an account's nominating pool commission.
 */
const oneShot_nomination_pool_commission = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.nominationPools.bondedPools(task.actionArgs!);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_commission(data, entry, true);
};

/**
 * @name oneShot_nominating_pending_payouts
 * @summary One-shot call to fetch an account's nominating pending paypouts.
 */
const oneShot_nominating_era_rewards = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.staking.activeEra();
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nominating_era_rewards(data, entry, true);
};

/**
 * @name oneShot_nominating_exposure
 * @summary One-shot call to fetch an account's nominating exposure.
 */
const oneShot_nominating_exposure = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const entry: ApiCallEntry = { curVal: null, task };
  const data = await api.query.staking.activeEra();
  return await Callbacks.callback_nominating_exposure(data, entry, true);
};

/**
 * @name oneShot_nominating_commission
 * @summary One-shot call to see a change in commission.
 */
const oneShot_nominating_commission = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.staking.activeEra();
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nominating_commission(data, entry, true);
};

/**
 * @name oneShot_nominating_nominations
 * @summary One-shot call to see a change in nominations.
 */
const oneShot_nominating_nominations = async (
  task: SubscriptionTask,
  instance: Api
): Promise<boolean> => {
  const { api } = instance;
  const data = await api.query.staking.activeEra();
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nominating_nominations(data, entry, true);
};
