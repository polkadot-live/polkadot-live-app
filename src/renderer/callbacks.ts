// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@/controller/renderer/AccountsController';
import BigNumber from 'bignumber.js';
import { chainUnits } from '@/config/chains';
import { checkAccountWithProperties } from '@/utils/AccountUtils';
import { EventsController } from '@/controller/renderer/EventsController';
import { ellipsisFn, planckToUnit } from '@w3ux/utils';
import { u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import * as ApiUtils from '@/utils/ApiUtils';
import type { ApiCallEntry } from '@/types/subscriptions';
import type { AnyData } from '@/types/misc';
import type { EventCallback, NotificationData } from '@/types/reporter';
import type { QueryMultiWrapper } from '@/model/QueryMultiWrapper';

export class Callbacks {
  /**
   * @name callback_query_timestamp_now
   * @summary Callback for 'subscribe:chain:timestamp'.
   *
   * Get the timestamp of the target chain and render it as a notification on
   * the frontend.
   */
  static callback_query_timestamp_now(
    data: AnyData,
    entry: ApiCallEntry,
    wrapper: QueryMultiWrapper
  ) {
    const { action, chainId } = entry.task;
    const timeBuffer = 20;

    const newVal = new BigNumber(data);
    const curVal = new BigNumber(
      wrapper.getChainTaskCurrentVal(action, chainId)
    );

    // Return if value hasn't changed since last callback or time buffer hasn't passed.
    if (
      JSON.stringify(newVal) === JSON.stringify(curVal) ||
      newVal.minus(curVal).lte(timeBuffer)
    ) {
      return;
    }

    // Cache new value.
    wrapper.setChainTaskVal(entry, newVal, chainId);

    // Debugging.
    const now = new Date(data * 1000).toDateString();
    console.log(`Now: ${now} | ${data}`);

    // Send IPC message to main process to handle notification and events.
    const event = EventsController.getEvent(entry, String(newVal));
    window.myAPI.persistEvent(event, null);
  }

  /**
   * @name callback_query_babe_currentSlot
   * @summary Callback for 'subscribe:chain:currentSlot'.
   *
   * Get the current slot of the target chain and render it as a notification
   * on the frontend.
   */
  static callback_query_babe_currentSlot(
    data: AnyData,
    entry: ApiCallEntry,
    wrapper: QueryMultiWrapper
  ) {
    const { action, chainId } = entry.task;
    const newVal = new BigNumber(data);
    const curVal = wrapper.getChainTaskCurrentVal(action, chainId);

    // Return if value hasn't changed since last callback.
    if (JSON.stringify(newVal) === JSON.stringify(curVal)) {
      return;
    }

    // Cache new value.
    wrapper.setChainTaskVal(entry, newVal, chainId);

    // Debugging.
    console.log(`Current Sot: ${newVal}`);

    // Send IPC message to main process to handle notification and events.
    const event = EventsController.getEvent(entry, String(newVal));
    window.myAPI.persistEvent(event, null);
  }

  /**
   * @name callback_query_system_account
   * @summary Callback for 'subscribe:account:balance'.
   *
   * Get the balance of the task target account on the target chain. Returns
   * the balance's nonce, free and reserved values.
   */
  static callback_query_system_account(data: AnyData, entry: ApiCallEntry) {
    // Exit early if initial checks fail.
    const account = checkAccountWithProperties(entry, ['balance']);
    if (account === null) {
      return;
    }

    // Get the received balance.
    const received = {
      free: new BigNumber(data.data.free),
      reserved: new BigNumber(data.data.reserved),
      frozen: new BigNumber(data.data.frozen),
      nonce: new BigNumber(data.nonce),
    };

    // Exit early if balance hasn't changed.
    if (
      received.free.eq(account.balance!.free) &&
      received.reserved.eq(account.balance!.reserved) &&
      received.frozen.eq(account.balance!.frozen) &&
      received.nonce.eq(account.balance!.nonce)
    ) {
      return;
    }

    // Update account data.
    account.balance = received;
    AccountsController.set(account.chain, account);

    // Create event and parse into same format as persisted events.
    const event = EventsController.getEvent(entry, { ...received });
    const parsed: EventCallback = JSON.parse(JSON.stringify(event));

    // Send event and notification data to main process.
    window.myAPI.persistEvent(parsed, {
      title: ellipsisFn(entry.task.account!.address),
      body: `Free balance: ${received.free}`,
    } as NotificationData);
  }

  /**
   * @name callback_nomination_pool_reward_account
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
  static async callback_nomination_pool_reward_account(entry: ApiCallEntry) {
    // Exit early if initial checks fail.
    const account = checkAccountWithProperties(entry, ['nominationPoolData']);
    if (account === null) {
      return;
    }

    const chainId = account.chain;
    const { api } = await ApiUtils.getApiInstance(chainId);

    // Fetch pending rewards for the account.
    const pendingRewardsPlanck: BigNumber =
      await api.call.nominationPoolsApi.pendingRewards(account.address);

    // Return if pending rewards is zero.
    if (pendingRewardsPlanck.eq(0)) {
      return;
    }

    // Update account and entry data.
    account.nominationPoolData!.poolPendingRewards = pendingRewardsPlanck;
    AccountsController.set(chainId, account);
    entry.task.account = account.flatten();

    // Handle notification and events in main process.
    window.myAPI.persistEvent(EventsController.getEvent(entry, {}), {
      title: 'Unclaimed Nomination Pool Rewards',
      body: `${planckToUnit(new BigNumber(pendingRewardsPlanck.toString()), chainUnits(chainId))}`,
    } as NotificationData);
  }

  /**
   * @name callback_nomination_pool_state
   * @summary Callback for 'subscribe:account:nominationPools:state'
   *
   * When a nomination pool's state changes, dispatch an event and notificaiton.
   */
  static async callback_nomination_pool_state(
    data: AnyData,
    entry: ApiCallEntry
  ) {
    // Exit early if initial checks fail.
    const account = checkAccountWithProperties(entry, ['nominationPoolData']);
    if (account === null) {
      return;
    }

    // Get the received pool state.
    const receivedPoolState: string = data.toHuman().state;
    if (account.nominationPoolData!.poolState === receivedPoolState) {
      return;
    }

    // Update account and entry data.
    account.nominationPoolData!.poolState = receivedPoolState;
    AccountsController.set(account.chain, account);
    entry.task.account = account.flatten();

    // Handle notification and events in main process.
    window.myAPI.persistEvent(EventsController.getEvent(entry, {}), {
      title: 'Nomination Pool State',
      body: `${receivedPoolState}`,
    } as NotificationData);
  }

  /**
   * @name callback_nomination_pool_renamed
   * @summary Callback for 'subscribe:account:nominationPools:renamed'
   *
   * When a nomination pool's name changes, dispatch an event and notificaiton.
   */
  static async callback_nomination_pool_renamed(
    data: AnyData,
    entry: ApiCallEntry
  ) {
    // Exit early if initial checks fail.
    const account = checkAccountWithProperties(entry, ['nominationPoolData']);
    if (account === null) {
      return;
    }

    // Get the received pool name.
    const receivedPoolName: string = u8aToString(u8aUnwrapBytes(data));
    if (account.nominationPoolData!.poolName === receivedPoolName) {
      return;
    }

    // Update account and entry data.
    account.nominationPoolData!.poolName = receivedPoolName;
    AccountsController.set(account.chain, account);
    entry.task.account = account.flatten();

    // Handle notification and events in main process.
    window.myAPI.persistEvent(EventsController.getEvent(entry, {}), {
      title: 'Nomination Pool Name',
      body: `${receivedPoolName}`,
    } as NotificationData);
  }

  /**
   * @name callback_nomination_pool_roles
   * @summary Callback for 'subscribe:account:nominationPools:roles'
   *
   * When a nomination pool's name changes, dispatch an event and notificaiton.
   */
  static async callback_nomination_pool_roles(
    data: AnyData,
    entry: ApiCallEntry
  ) {
    // Exit early if initial checks fail.
    const account = checkAccountWithProperties(entry, ['nominationPoolData']);
    if (account === null) {
      return;
    }

    // Get the received pool roles.
    const { depositor, root, nominator, bouncer } = data.toHuman().roles;

    // Return if roles have not changed.
    const poolRoles = account.nominationPoolData!.poolRoles;
    if (
      poolRoles.depositor === depositor &&
      poolRoles.root === root &&
      poolRoles.nominator === nominator &&
      poolRoles.bouncer === bouncer
    ) {
      return;
    }

    // Update account and entry data.
    // eslint-disable-next-line prettier/prettier
    account.nominationPoolData!.poolRoles = { depositor, root, nominator, bouncer };
    AccountsController.set(account.chain, account);
    entry.task.account = account.flatten();

    // Handle notification and events in main process.
    window.myAPI.persistEvent(EventsController.getEvent(entry, {}), {
      title: 'Nomination Pool Roles',
      body: `Roles have changed`,
    } as NotificationData);
  }
}
