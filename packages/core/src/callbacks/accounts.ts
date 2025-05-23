// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '../config';
import { checkAccountWithProperties } from '../library/AccountsLib';
import { areSortedArraysEqual } from '../library/CommonLib';
import {
  AccountsController,
  APIsController,
  EventsController,
  NotificationsController,
} from '../controllers';
import {
  getAccountNominatingData,
  getEraRewards,
} from '../library/AccountsLib/nominating';
import { u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import type {
  ApiCallEntry,
  PostCallbackFlags,
} from '@polkadot-live/types/subscriptions';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { QueryMultiWrapper } from '../model';
import type {
  NominationPoolCommission,
  NominationPoolRoles,
} from '@polkadot-live/types/accounts';
import type {
  PalletBalancesAccountData,
  PalletNominationPoolsBondedPoolInner,
  PalletStakingActiveEraInfo,
} from '@dedot/chaintypes/substrate';

/**
 * @name callback_query_timestamp_now
 * @summary Callback for 'subscribe:chain:timestamp'.
 *
 * Get the timestamp of the target chain and render it as a notification on
 * the frontend.
 */
export const callback_query_timestamp_now = (
  data: AnyData,
  entry: ApiCallEntry,
  wrapper: QueryMultiWrapper
) => {
  try {
    const { action, chainId } = entry.task;
    const timeBuffer = 20;
    const cached = wrapper.getChainTaskCurrentVal(action, chainId);
    const prev: bigint = cached ? BigInt(cached) : 0n;
    const cur = BigInt(data.toString());

    // Return if value hasn't changed since last callback or time buffer hasn't passed.
    if (cur === prev || cur - prev <= timeBuffer) {
      return;
    }

    // Cache new value.
    wrapper.setChainTaskVal(entry, cur.toString(), chainId);

    // Debugging.
    const now = new Date(Number(cur) * 1000).toDateString();
    console.log(`Now: ${now} | ${data}`);

    // Send event and notification data to main process.
    const event = EventsController.getEvent(entry, cur.toString());
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: { event, notification: null, isOneShot: false },
    });
  } catch (err) {
    console.error(err);
    return;
  }
};

/**
 * @name callback_query_babe_currentSlot
 * @summary Callback for 'subscribe:chain:currentSlot'.
 *
 * Get the current slot of the target chain and render it as a notification
 * on the frontend.
 */
export const callback_query_babe_currentSlot = (
  data: AnyData,
  entry: ApiCallEntry,
  wrapper: QueryMultiWrapper
) => {
  try {
    const { action, chainId } = entry.task;
    const cached = wrapper.getChainTaskCurrentVal(action, chainId);
    const prev = cached ? BigInt(cached) : 0n;
    const cur = BigInt(data.toString());

    // Return if value hasn't changed since last callback.
    if (cur === prev) {
      return;
    }

    // Cache new value.
    wrapper.setChainTaskVal(entry, cur.toString(), chainId);

    // Debugging.
    console.log(`Current Sot: ${cur}`);

    // Send event and notification data to main process.
    const event = EventsController.getEvent(entry, cur.toString());
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: { event, notification: null, isOneShot: false },
    });
  } catch (err) {
    console.error(err);
    return;
  }
};

/**
 * @name callback_account_balance_free
 * @summary Handle callback for an account's free balance subscription.
 */
export const callback_account_balance_free = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    // Get account.
    const account = AccountsController.get(
      entry.task.chainId,
      entry.task.account!.address
    );

    if (!account || !account.balance) {
      return false;
    }

    // Get the received balance.
    const chainId = account.chain;
    const balance = data.data as PalletBalancesAccountData;
    const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);

    const free =
      chainId === 'Westend'
        ? balance.free
        : balance.free - max(balance.reserved, balance.frozen);

    const b = account.balance;
    const isSame = b.free ? free === b.free : false;

    // Exit early if nothing has changed.
    if (!isOneShot && isSame) {
      return true;
    }

    // Update account data if balance has changed.
    if (!isSame) {
      syncFlags.syncAccountBalance = true;
    }

    // Create event and parse into same format as persisted events.
    const event = EventsController.getEvent(entry, { free });
    const parsed: EventCallback = JSON.parse(JSON.stringify(event));

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, { free })
      : null;

    // Send event and notification data to main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: { event: parsed, notification, isOneShot },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_account_balance_frozen
 * @summary Handle callback for an account's frozen balance subscription.
 */
export const callback_account_balance_frozen = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    // Get account.
    const account = AccountsController.get(
      entry.task.chainId,
      entry.task.account!.address
    );

    if (!account || !account.balance) {
      return false;
    }

    // Get the received frozen balance.
    const { frozen } = data.data as PalletBalancesAccountData;
    const b = account.balance;
    const isSame = b.frozen ? frozen === b.frozen : false;

    // Exit early if nothing has changed.
    if (!isOneShot && isSame) {
      return true;
    }

    // Update account data if balance has changed.
    if (!isSame) {
      syncFlags.syncAccountBalance = true;
    }

    // Create event and parse into same format as persisted events.
    const event = EventsController.getEvent(entry, { frozen });
    const parsed: EventCallback = JSON.parse(JSON.stringify(event));

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, { frozen })
      : null;

    // Send event and notification data to main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: { event: parsed, notification, isOneShot },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_account_balance_reserved
 * @summary Handle callback for an account's reserved balance subscription.
 */
export const callback_account_balance_reserved = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    // Get account.
    const account = AccountsController.get(
      entry.task.chainId,
      entry.task.account!.address
    );

    if (!account || !account.balance) {
      return false;
    }

    // Get the received reserved balance.
    const { reserved } = data.data as PalletBalancesAccountData;
    const b = account.balance;
    const isSame = b.reserved ? reserved === b.reserved : false;

    // Exit early if nothing has changed.
    if (!isOneShot && isSame) {
      return true;
    }

    // Update account data if balance has changed.
    if (!isSame) {
      syncFlags.syncAccountBalance = true;
    }

    // Create an event and parse into same format as persisted event.
    const event = EventsController.getEvent(entry, { reserved });
    const parsed: EventCallback = JSON.parse(JSON.stringify(event));

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, { reserved })
      : null;

    // Send event and notification data to main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: { event: parsed, notification, isOneShot },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_account_balance_spendable
 * @summary Handle callback for an account's spendable balance subscription.
 */
export const callback_account_balance_spendable = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    // Get account.
    const account = AccountsController.get(
      entry.task.chainId,
      entry.task.account!.address
    );

    if (!account || !account.balance) {
      return false;
    }

    // Spendable balance equation:
    // spendable = free - max(max(frozen, reserved), ed)
    const api = await getApiOrThrow(account.chain);
    const ed = api.consts.balances.existentialDeposit;
    const { free, frozen, reserved } = data.data as PalletBalancesAccountData;
    const chainId = account.chain;

    const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);
    const spendable =
      chainId === 'Westend'
        ? max(free - ed, 0n)
        : max(free - max(frozen, reserved) - ed, 0n);

    // Check if spendable balance has changed.
    const b = account.balance;
    const cur =
      chainId === 'Westend'
        ? max(b.free - ed, 0n)
        : max(b.free - max(b.frozen, b.reserved) - ed, 0n);

    // Exit early if nothing has changed.
    const isSame = spendable === cur;
    if (!isOneShot && isSame) {
      return true;
    }

    // Update account nonce if balance has changed.
    if (!isSame) {
      syncFlags.syncAccountBalance = true;
    }

    // Create an event and parse into same format as persisted event.
    const event = EventsController.getEvent(entry, { spendable });
    const parsed: EventCallback = JSON.parse(JSON.stringify(event));

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, { spendable })
      : null;

    // Send event and notification to main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: { event: parsed, notification, isOneShot },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_nomination_pool_rewards
 * @summary Callback for 'subscribe:account:nominationPools:rewards'.
 *
 * When a nomination pool's free balance changes, check that the subscribed
 * account's pending rewards has changed. If pending rewards have changed,
 * send a notification to inform the user.
 *
 * We need to send a new event if the account has pending rewards.
 * Another process can then check if the event should be rendererd,
 * or whether it's a duplicate.
 */
export const callback_nomination_pool_rewards = async (
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    const account = checkAccountWithProperties(entry, ['nominationPoolData']);
    const api = await getApiOrThrow(account.chain);

    // Fetch pending rewards for the account.
    const pending = await api.call.nominationPoolsApi.pendingRewards(
      account.address
    );

    const cur = BigInt(account.nominationPoolData!.poolPendingRewards);
    const isSame = cur === pending;

    // Return if pending rewards is zero or no change.
    if ((!isOneShot && isSame) || (!isOneShot && pending === 0n)) {
      return true;
    }

    // Update account and entry data.
    if (!isSame) {
      syncFlags.syncAccountNominationPool = true;
    }

    // Get event and notification.
    const event = EventsController.getEvent(entry, { pending });
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, { pending })
      : null;

    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: { event, notification, isOneShot },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_nomination_pool_state
 * @summary Callback for 'subscribe:account:nominationPools:state'
 *
 * When a nomination pool's state changes, dispatch an event and notificaiton.
 */
export const callback_nomination_pool_state = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    const account = checkAccountWithProperties(entry, ['nominationPoolData']);

    // Get the received pool state.
    const casted = data as PalletNominationPoolsBondedPoolInner;
    const state = casted.state as string;
    const cur = account.nominationPoolData!.poolState;
    const isSame = cur === state;

    if (!isOneShot && isSame) {
      return true;
    }

    // Update account and entry data.
    if (!isSame) {
      syncFlags.syncAccountNominationPool = true;
    }

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, {
          cur: state,
          prev: cur,
        })
      : null;

    // Handle notification and events in main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: {
        event: EventsController.getEvent(entry, { cur: state, prev: cur }),
        notification,
        isOneShot,
      },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_nomination_pool_renamed
 * @summary Callback for 'subscribe:account:nominationPools:renamed'
 *
 * When a nomination pool's name changes, dispatch an event and notificaiton.
 */
export const callback_nomination_pool_renamed = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    const account = checkAccountWithProperties(entry, ['nominationPoolData']);

    // Get the received pool name.
    const poolName: string = u8aToString(u8aUnwrapBytes(data));
    const cur = account.nominationPoolData!.poolName;
    const isSame = cur === poolName || poolName === '';

    if (!isOneShot && isSame) {
      return true;
    }

    // Update account and entry data.
    if (!isSame) {
      syncFlags.syncAccountNominationPool = true;
    }

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, {
          cur: poolName,
          prev: cur,
        })
      : null;

    // Handle notification and events in main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: {
        event: EventsController.getEvent(entry, { cur: poolName, prev: cur }),
        notification,
        isOneShot,
      },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_nomination_pool_roles
 * @summary Callback for 'subscribe:account:nominationPools:roles'
 *
 * When a nomination pool's roles changes, dispatch an event and notificaiton.
 */
export const callback_nomination_pool_roles = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    const account = checkAccountWithProperties(entry, ['nominationPoolData']);

    // Get the received pool roles.
    const api = await getApiOrThrow(account.chain);
    const prefix = api.consts.system.ss58Prefix;
    const casted = data as PalletNominationPoolsBondedPoolInner;
    const { depositor, root, nominator, bouncer } = casted.roles;

    const roles: NominationPoolRoles = {
      depositor: depositor.address(prefix),
      root: root ? root.address(prefix) : undefined,
      nominator: nominator ? nominator.address(prefix) : undefined,
      bouncer: bouncer ? bouncer.address(prefix) : undefined,
    };

    // Return if roles have not changed.
    const cur = account.nominationPoolData!.poolRoles;

    const isSame =
      cur.depositor === roles.depositor &&
      cur.root === roles.root &&
      cur.nominator === roles.nominator &&
      cur.bouncer === roles.bouncer;

    if (!isOneShot && isSame) {
      return true;
    }

    // Update account and entry data.
    if (!isSame) {
      syncFlags.syncAccountNominationPool = true;
    }

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, {
          cur: roles,
          prev: cur,
        })
      : null;

    // Handle notification and events in main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: {
        event: EventsController.getEvent(entry, { cur: roles, prev: cur }),
        notification,
        isOneShot,
      },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_nomination_pool_commission
 * @summary Callback for 'subscribe:account:nominationPools:commission'
 *
 * When a nomination pool's commission data changes, dispatch an event and notificaiton.
 */
export const callback_nomination_pool_commission = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    const account = checkAccountWithProperties(entry, ['nominationPoolData']);

    // Get the received pool commission.
    const casted = data as PalletNominationPoolsBondedPoolInner;
    const { changeRate, current, max, throttleFrom } = casted.commission;

    const cur: NominationPoolCommission = {
      current: current ? [current[0].toString(), current[1].raw] : undefined,
      max: max ? max.toString() : undefined,
      changeRate: changeRate
        ? {
            maxIncrease: changeRate.maxIncrease.toString(),
            minDelay: changeRate.minDelay.toString(),
          }
        : undefined,
      throttleFrom: throttleFrom ? throttleFrom.toString() : undefined,
    };

    // Return if roles have not changed.
    const poolCommission = account.nominationPoolData!.poolCommission;

    const isSame =
      JSON.stringify(poolCommission.changeRate) ===
        JSON.stringify(cur.changeRate) &&
      JSON.stringify(poolCommission.current) === JSON.stringify(cur.current) &&
      poolCommission.throttleFrom === cur.throttleFrom &&
      poolCommission.max === cur.max;

    if (!isOneShot && isSame) {
      return true;
    }

    // Update account and entry data.
    if (!isSame) {
      syncFlags.syncAccountNominationPool = true;
    }

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, {
          cur,
          prev: poolCommission,
        })
      : null;

    // Handle notification and events in main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: {
        event: EventsController.getEvent(entry, {
          cur,
          prev: poolCommission,
        }),
        notification,
        isOneShot,
      },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/*
 * @name callback_nominating_era_rewards
 * @summary Callback for 'subscribe:account:nominating:pendingPayouts'
 */
export const callback_nominating_era_rewards = async (
  entry: ApiCallEntry,
  isOneShot = false
): Promise<boolean> => {
  try {
    // Check if account has nominating rewards from the previous era.
    const account = checkAccountWithProperties(entry, ['nominatingData']);

    // Calculate rewards.
    const api = await getApiOrThrow(account.chain);
    const eraResult = await api.query.staking.activeEra();
    const lastEra = eraResult!.index - 1;
    const eraRewards = await getEraRewards(account.address, api, lastEra);

    // Get notification and event.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, {
          rewards: eraRewards.toString(),
          chainId: account.chain,
        })
      : null;

    const event = EventsController.getEvent(entry, {
      rewards: eraRewards.toString(),
      era: lastEra.toString(),
    });

    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: { event, notification, isOneShot },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_nominating_exposure
 * @summary Callback for 'subscribe:account:nominating:exposure'
 *
 * Dispatch an event and notificaiton informing whether a nominator is
 * exposed in the current era. A nominator is exposed if at least one
 * of their nominated validators is in the era's validator set.
 *
 * The nominating account needs to be in the top 512 nominators (have
 * enough stake) to earn rewards from a particular validator.
 */
export const callback_nominating_exposure = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    const casted = data as PalletStakingActiveEraInfo;
    const era: number = casted.index;
    const account = checkAccountWithProperties(entry, ['nominatingData']);
    const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

    // Exit early if this era exposure is already known for this account.
    if (!isOneShot && alreadyKnown) {
      return true;
    }

    // Cache previous exposure.
    const { exposed: prevExposed } = account.nominatingData!;
    const api = await getApiOrThrow(account.chain);

    // Update account nominating data.
    const maybeNominatingData = await getAccountNominatingData(api, account);

    // Return if exposure has not changed.
    const exposed = maybeNominatingData ? maybeNominatingData.exposed : false;
    if (!isOneShot && prevExposed === exposed) {
      return true;
    }

    // Update account nominating data in post process.
    if (prevExposed !== exposed) {
      syncFlags.syncAccountNominating = true;
    }

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, {
          era,
          exposed,
        })
      : null;

    // Handle notification and events in main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: {
        event: EventsController.getEvent(entry, { era, exposed }),
        notification,
        isOneShot,
      },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_nominating_commission
 * @summary Callback for 'subscribe:account:nominating:commission'
 *
 * Dispatches an event and native OS notification if the account's nominated
 * validator's commission has changed.
 */
export const callback_nominating_commission = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    const casted = data as PalletStakingActiveEraInfo;
    const era: number = casted.index;
    const account = checkAccountWithProperties(entry, ['nominatingData']);
    const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

    // Exit early if nominator data for this era is already known for this account.
    if (!isOneShot && alreadyKnown) {
      return true;
    }

    // Get live nominator data and check to see if it has changed.
    const api = await getApiOrThrow(account.chain);

    // Cache previous commissions.
    const prev = account.nominatingData!.validators.map((v) => v.commission);
    let hasChanged = false;

    // Update account nominating data.
    const maybeNominatingData = await getAccountNominatingData(api, account);

    // Return if commissions haven't changed.
    if (maybeNominatingData) {
      const cur = maybeNominatingData.validators.map((v) => v.commission);
      const areEqual = areSortedArraysEqual(prev, cur);

      if (!areEqual) {
        hasChanged = true;
        syncFlags.syncAccountNominating = true;
      } else if (!isOneShot && areEqual) {
        return true;
      }
    } else {
      // Commission changes if account no longer nominating.
      hasChanged = true;
    }

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, {
          hasChanged,
        })
      : null;

    // Handle notification and events in main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: {
        event: EventsController.getEvent(entry, { era, hasChanged }),
        notification,
        isOneShot,
      },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name callback_nominating_nominations
 * @summary Callback for 'subscribe:account:nominating:nominations'
 *
 * Dispatches an event and native OS notification if the account's nominated
 * validator set has changed.
 */
export const callback_nominating_nominations = async (
  data: AnyData,
  entry: ApiCallEntry,
  syncFlags: PostCallbackFlags,
  isOneShot = false
): Promise<boolean> => {
  try {
    const casted = data as PalletStakingActiveEraInfo;
    const era: number = casted.index;
    const account = checkAccountWithProperties(entry, ['nominatingData']);
    const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

    // Exit early if nominator data for this era is already known for this account.
    if (!isOneShot && alreadyKnown) {
      return true;
    }

    // Get live nominator data and check to see if it has changed.
    const api = await getApiOrThrow(account.chain);

    // Cache previous nominations.
    const prev = account.nominatingData!.validators.map((v) => v.validatorId);
    let hasChanged = false;

    // Update account nominating data.
    const maybeNominatingData = await getAccountNominatingData(api, account);

    // Return if nominations haven't changed.
    if (maybeNominatingData) {
      const cur = maybeNominatingData.validators.map((v) => v.validatorId);
      const areEqual = areSortedArraysEqual(prev, cur);

      if (!areEqual) {
        hasChanged = true;
        syncFlags.syncAccountNominating = true;
      } else if (!isOneShot && areEqual) {
        return true;
      }
    } else {
      // Nominations have changed if account no longer nominating.
      hasChanged = true;
    }

    // Get notification.
    const notification = getNotificationFlag(entry, isOneShot)
      ? NotificationsController.getNotification(entry, account, {
          hasChanged,
        })
      : null;

    // Handle notification and events in main process.
    window.myAPI.sendEventTask({
      action: 'events:persist',
      data: {
        event: EventsController.getEvent(entry, { era, hasChanged }),
        notification,
        isOneShot,
      },
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * @name getApiOrThrow
 * @summary Get an API instance of throw.
 */
const getApiOrThrow = async (chainId: ChainID) =>
  (await APIsController.getConnectedApiOrThrow(chainId)).getApi();

/**
 * @name showNotificationFlag
 * @summary Determine if the task should show a native OS notification.
 */
const getNotificationFlag = (entry: ApiCallEntry, isOneShot: boolean) =>
  isOneShot
    ? true
    : !ConfigRenderer.silenceNotifications && entry.task.enableOsNotifications;
