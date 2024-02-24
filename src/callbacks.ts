// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from './controller/AccountsController';
import * as ApiUtils from '@/utils/ApiUtils';
import BigNumber from 'bignumber.js';
import { chainUnits } from './config/chains';
import { compareHashes } from './utils/CryptoUtils';
import { ellipsisFn, planckToUnit } from '@polkadot-cloud/utils';
import { EventsController } from './controller/EventsController';
import { NotificationsController } from './controller/NotificationsController';
import { WindowsController } from './controller/WindowsController';
import type { ApiCallEntry } from './types/subscriptions';
import type { AnyData } from './types/misc';
import type { QueryMultiWrapper } from './model/QueryMultiWrapper';

export class Callbacks {
  /**
   * @name callback_query_timestamp_now
   * @summary Callback for 'subscribe:query.timestamp.now'.
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
    if (compareHashes(newVal, curVal) || newVal.minus(curVal).lte(timeBuffer)) {
      return;
    }

    // Cache new value.
    wrapper.setChainTaskVal(entry, newVal, chainId);

    // Debugging.
    const now = new Date(data * 1000).toDateString();
    console.log(`Now: ${now} | ${data}`);

    // Create and persist event to store, and send to renderer.
    const event = EventsController.getEvent(entry, String(newVal));
    EventsController.persistEvent(event);

    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:new',
      event
    );
  }

  /**
   * @name callback_query_babe_currentSlot
   * @summary Callback for 'subscribe:query.babe.currentSlot'.
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
    if (compareHashes(newVal, curVal)) {
      return;
    }

    // Cache new value.
    wrapper.setChainTaskVal(entry, newVal, chainId);

    // Debugging.
    console.log(`Current Sot: ${newVal}`);

    // Create and persist event to store, and send to renderer.
    const event = EventsController.getEvent(entry, String(newVal));
    EventsController.persistEvent(event);

    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:new',
      event
    );
  }

  /**
   * @name callback_query_system_account
   * @summary Callback for 'subscribe:query.system.account'.
   *
   * Get the balance of the task target account on the target chain. Returns
   * the balance's nonce, free and reserved values.
   */
  static callback_query_system_account(data: AnyData, entry: ApiCallEntry) {
    const free = new BigNumber(data.data.free);
    const reserved = new BigNumber(data.data.reserved);
    const nonce = new BigNumber(data.nonce);

    // Debugging.
    console.log(
      `Account: Free balance is ${free} with ${reserved} reserved (nonce: ${nonce}).`
    );

    // Create event.
    const event = EventsController.getEvent(entry, {
      nonce,
      free,
      reserved,
    });

    // Persist event to store.
    EventsController.persistEvent(event);

    // Send event to renderer.
    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:new',
      event
    );

    // TMP: Show native OS notification.
    const addressName = ellipsisFn(entry.task.account!.address);
    NotificationsController.balanceChanged(addressName, free);
  }

  /**
   * @name callback_nomination_pool_reward_account
   * @summary Callback for 'subscribe:nominationPools:query.system.account'.
   *
   * When a nomination pool's free balance changes, check that the subscribed
   * account's pending rewards has changed. If pending rewards have changed,
   * send a notification to inform the user.
   */
  static async callback_nomination_pool_reward_account(entry: ApiCallEntry) {
    const { account: flattenedAccount, chainId } = entry.task;

    if (!flattenedAccount) {
      console.log('> Error getting flattened account data');
      return;
    }

    // Get associated account and API instances.
    const account = AccountsController.get(chainId, flattenedAccount.address);
    const { api } = await ApiUtils.getApiInstance(chainId);

    // Return if nomination pool data for account not found.
    if (!account?.nominationPoolData) {
      return;
    }

    // Get current pending rewards.
    const { poolPendingRewards } = account.nominationPoolData;

    // Fetch pending rewards for the account.
    const pendingRewardsResult =
      await api.call.nominationPoolsApi.pendingRewards(account.address);

    const fetchedPendingRewards = planckToUnit(
      new BigNumber(pendingRewardsResult.toString()),
      chainUnits(chainId)
    );

    // Return if pending rewards has not changed for the account.
    if (fetchedPendingRewards.eq(poolPendingRewards)) {
      return;
    }

    // Add nomination pool data to account.
    account.nominationPoolData = {
      ...account.nominationPoolData,
      poolPendingRewards: fetchedPendingRewards,
    };

    // Update account data in controller.
    AccountsController.set(chainId, account);

    // Construct and send event to renderer to display new reward balance.
    const event = EventsController.getEvent(entry, {});
    EventsController.persistEvent(event);

    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:new',
      event
    );
  }
}
