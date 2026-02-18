// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Callbacks from '../callbacks';
import { AccountsController, APIsController } from '../controllers';
import {
  getPostCallbackFlags,
  processOneShotPostCallback,
} from '../library/CallbackLib';
import type { DedotClientSet } from '@polkadot-live/types/apis';
import type {
  ApiCallEntry,
  PostCallbackFlags,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';
import type { Account } from '../model';

export const executeOneShot = async (
  task: SubscriptionTask,
): Promise<boolean> => {
  const { chainId } = task;

  // Return early if network failed to connect.
  if (APIsController.getFailedChainIds().includes(chainId)) {
    return false;
  }
  const client = await APIsController.getConnectedApi(chainId);
  if (!client || !client.api) {
    return false;
  }
  const { api } = client;

  // Handle simple tasks.
  if (task.action === 'subscribe:account:nominating:pendingPayouts') {
    return await oneShot_nominating_era_rewards(task);
  }
  // Handle tasks requiring account.
  const account = getTaskAccount(task);
  if (!account) {
    return false;
  }

  // Args tuple.
  type TupleArg = [SubscriptionTask, DedotClientSet, PostCallbackFlags];
  const flags = getPostCallbackFlags();
  const args: TupleArg = [task, api, flags];
  let result: boolean;

  switch (task.action) {
    case 'subscribe:account:balance:free':
      result = await oneShot_account_balance_free(...args);
      break;
    case 'subscribe:account:balance:frozen':
      result = await oneShot_account_balance_frozen(...args);
      break;
    case 'subscribe:account:balance:reserved':
      result = await oneShot_account_balance_reserved(...args);
      break;
    case 'subscribe:account:balance:spendable':
      result = await oneShot_account_balance_spendable(...args);
      break;
    case 'subscribe:account:nominationPools:state':
      result = await oneShot_nomination_pool_state(...args);
      break;
    case 'subscribe:account:nominationPools:renamed':
      result = await oneShot_nomination_pool_renamed(...args);
      break;
    case 'subscribe:account:nominationPools:rewards':
      result = await oneShot_nomination_pool_rewards(task, flags);
      break;
    case 'subscribe:account:nominationPools:roles':
      result = await oneShot_nomination_pool_roles(...args);
      break;
    case 'subscribe:account:nominationPools:commission':
      result = await oneShot_nomination_pool_commission(...args);
      break;
    case 'subscribe:account:nominating:exposure':
      result = await oneShot_nominating_exposure(...args);
      break;
    case 'subscribe:account:nominating:commission':
      result = await oneShot_nominating_commission(...args);
      break;
    case 'subscribe:account:nominating:nominations':
      result = await oneShot_nominating_nominations(...args);
      break;
    default:
      result = false;
      break;
  }

  result && (await postOneShotCallback(api, account, flags));
  return result;
};

/**
 * @name getTaskAccount
 * @summary Get the account associated with a subscription task.
 */
const getTaskAccount = (task: SubscriptionTask): Account | null =>
  task.account
    ? AccountsController.get(task.chainId, task.account!.address) || null
    : null;

/**
 * @name postOneShotCallback
 * @summary Update managed account data after processing callback.
 */
const postOneShotCallback = async (
  api: DedotClientSet,
  account: Account,
  flags: PostCallbackFlags,
) => {
  await processOneShotPostCallback(api, account, flags);
  const flattened = account.flatten();
  account.queryMulti?.updateEntryAccountData(account.chain, flattened);
};

/**
 * @name oneShot_account_balance_free
 * @summary One-shot call to fetch an account's free balance.
 */
const oneShot_account_balance_free = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const { address } = task.account!;
  const data = await api.query.system.account(address);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_account_balance_free(
    data,
    entry,
    flags,
    true,
  );
};

/**
 * @name oneShot_account_balance_frozen
 * @summary One-shot to fetch an account's frozen balance.
 */
const oneShot_account_balance_frozen = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const { address } = task.account!;
  const data = await api.query.system.account(address);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_account_balance_frozen(
    data,
    entry,
    flags,
    true,
  );
};

/**
 * @name oneShot_account_balance_reserved
 * @summary One-shot to fetch an account's reserved balance.
 */
const oneShot_account_balance_reserved = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const { address } = task.account!;
  const data = await api.query.system.account(address);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_account_balance_reserved(
    data,
    entry,
    flags,
    true,
  );
};

/**
 * @name oneShot_account_balance_spendable
 * @summary One-shot to fetch an account's spendable balance.
 */
const oneShot_account_balance_spendable = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const { address } = task.account!;
  const data = await api.query.system.account(address);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_account_balance_spendable(
    data,
    entry,
    flags,
    true,
  );
};

/**
 * @name oneShot_nomination_pool_rewards
 * @summary One-shot call to fetch an account's nominating pool rewards.
 */
const oneShot_nomination_pool_rewards = async (
  task: SubscriptionTask,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_rewards(entry, flags, true);
};

/**
 * @name oneShot_nomination_pool_state
 * @summary One-shot call to fetch an account's nominating pool state.
 */
const oneShot_nomination_pool_state = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const arg = Number(task.actionArgs![0]);
  const data = await api.query.nominationPools.bondedPools(arg);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_state(
    data,
    entry,
    flags,
    true,
  );
};

/**
 * @name oneShot_nomination_pool_renamed
 * @summary One-shot call to fetch an account's nominating pool name.
 */
const oneShot_nomination_pool_renamed = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const arg = Number(task.actionArgs![0]);
  const data = await api.query.nominationPools.metadata(arg);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_renamed(
    data,
    entry,
    flags,
    true,
  );
};

/**
 * @name oneShot_nomination_pool_roles
 * @summary One-shot call to fetch an account's nominating pool roles.
 */
const oneShot_nomination_pool_roles = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const arg = Number(task.actionArgs![0]);
  const data = await api.query.nominationPools.bondedPools(arg);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_roles(
    data,
    entry,
    flags,
    true,
  );
};

/**
 * @name oneShot_nomination_pool_commission
 * @summary One-shot call to fetch an account's nominating pool commission.
 */
const oneShot_nomination_pool_commission = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const arg = Number(task.actionArgs![0]);
  const data = await api.query.nominationPools.bondedPools(arg);
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nomination_pool_commission(
    data,
    entry,
    flags,
    true,
  );
};

/**
 * @name oneShot_nominating_pending_payouts
 * @summary One-shot call to fetch an account's nominating pending paypouts.
 */
const oneShot_nominating_era_rewards = async (
  task: SubscriptionTask,
): Promise<boolean> => {
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nominating_era_rewards(entry, true);
};

/**
 * @name oneShot_nominating_exposure
 * @summary One-shot call to fetch an account's nominating exposure.
 */
const oneShot_nominating_exposure = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const entry: ApiCallEntry = { curVal: null, task };
  const data = await api.query.staking.activeEra();
  return await Callbacks.callback_nominating_exposure(data, entry, flags, true);
};

/**
 * @name oneShot_nominating_commission
 * @summary One-shot call to see a change in commission.
 */
const oneShot_nominating_commission = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const data = await api.query.staking.activeEra();
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nominating_commission(
    data,
    entry,
    flags,
    true,
  );
};

/**
 * @name oneShot_nominating_nominations
 * @summary One-shot call to see a change in nominations.
 */
const oneShot_nominating_nominations = async (
  task: SubscriptionTask,
  api: DedotClientSet,
  flags: PostCallbackFlags,
): Promise<boolean> => {
  const data = await api.query.staking.activeEra();
  const entry: ApiCallEntry = { curVal: null, task };
  return await Callbacks.callback_nominating_nominations(
    data,
    entry,
    flags,
    true,
  );
};
