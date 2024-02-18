// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import * as ApiUtils from '@/utils/ApiUtils';
import { WindowsController } from '@/controller/WindowsController';
import type { ChainID } from '@/types/chains';
import type { AnyData, AnyFunction } from '@/types/misc';
import type {
  SubscriptionTask,
  QueryMultiEntry,
  ApiCallEntry,
} from '@/types/subscriptions';
import { compareHashes } from '@/utils/CryptoUtils';
import { AccountsController } from '@/controller/AccountsController';
import { planckToUnit } from '@polkadot-cloud/utils';
import { chainUnits } from '@/config/chains';
import { EventsController } from '@/controller/EventsController';

export class QueryMultiWrapper {
  /**
   * API call entries (subscription tasks) are keyed by their chain ID.
   */
  private subscriptions = new Map<ChainID, QueryMultiEntry>();

  /**
   * @name requiresApiInstanceForChain
   * @summary Returns `true` if an API instance is required for the provided chain ID for this wrapper, and `false` otherwise.
   * @returns {boolean} Represents if API instance is required for the provided chainID.
   */
  requiresApiInstanceForChain(chainId: ChainID) {
    return this.subscriptions.has(chainId);
  }

  /**
   * @name getSubscriptionTasks
   * @summary Returns the subscription tasks managed by this wrapper.
   * @returns {SubscriptionTask[]}
   */
  getSubscriptionTasks() {
    const result: SubscriptionTask[] = [];

    for (const entry of this.subscriptions.values()) {
      for (const { task } of entry.callEntries) {
        result.push({ ...task });
      }
    }

    return result;
  }

  /**
   * @name handleCallback
   * @summary Main logic to handle entries (subscription tasks).
   */
  private async handleCallback(
    index: number,
    entry: ApiCallEntry,
    dataArr: AnyData,
    chainId: ChainID
  ) {
    const { action } = entry.task;

    switch (chainId) {
      case 'Polkadot':
      case 'Westend':
      case 'Kusama': {
        switch (action) {
          // Get the timestamp of the target chain and render it as
          // a notification on the frontend.
          case 'subscribe:query.timestamp.now': {
            this.callback_query_timestamp_now(dataArr[index], entry);
            break;
          }

          // Get the current slot of the target chain and render it as
          // a notification on the frontend.
          case 'subscribe:query.babe.currentSlot': {
            this.callback_query_babe_currentSlot(dataArr[index], entry);
            break;
          }

          // Get the balance of the task target account on the target chain.
          // Returns the balance's nonce, free and reserved values.
          case 'subscribe:query.system.account': {
            this.callback_query_system_account(dataArr[index], entry);
            break;
          }

          // When a nomination pool free balance changes, check that the subscribed account's
          // pending rewards has changed. If pending rewards have changed, send a notification
          // to inform the user.
          case 'subscribe:nominationPools:query.system.account': {
            await this.callback_nomination_pool_reward_account(entry);
            break;
          }
        }
      }
    }
  }

  /**
   * @name build
   * @summary Dynamically build the query multi argument, and make the actual API call.
   * @param {ChainID} chainId - The target chain to subscribe to.
   */
  async build(chainId: ChainID) {
    if (!this.subscriptions.get(chainId)) {
      console.log('>> QueryMultiWrapper: queryMulti map is empty.');
      return;
    }

    // Construct the argument for new queryMulti call.
    const queryMultiArg: AnyData = this.buildQueryMultiArg(chainId);

    // Make the new call to queryMulti.
    console.log('>> QueryMultiWrapper: Call to queryMulti.');

    const instance = await ApiUtils.getApiInstance(chainId);
    const finalArg = queryMultiArg;

    // Call queryMulti api.
    const unsub = await instance.api.queryMulti(
      finalArg,
      // The queryMulti callback.
      async (data: AnyData) => {
        // Work out task to handle
        const { callEntries } = this.subscriptions.get(chainId)!;

        for (const [index, entry] of callEntries.entries()) {
          await this.handleCallback(index, entry, data, chainId);
        }
      }
    );

    // Replace the entry's unsub function
    this.replaceUnsub(chainId, unsub);
  }

  /**
   * @name insert
   * @summary Add an `ApiCallEntry` to be managed by this wrapper.
   * @param {SubscriptionTask} task - Subscription task associated with entry.
   * @param {AnyFunction} apiCall - API function call pointer associated with entry.
   */
  insert(task: SubscriptionTask, apiCall: AnyFunction) {
    // Return if API call already exists.
    if (this.actionExists(task.chainId, task.action)) {
      console.log('>> QueryMultiWrapper: Action already exists.');
      return;
    }

    // Construct new `ApiCallEntry`.
    const newEntry: ApiCallEntry = {
      apiCall,
      curVal: null,
      task: {
        ...task,
        actionArgs: task.actionArgs ? [...task.actionArgs] : undefined,
      },
    };

    // Insert new key if chain isn't cached yet.
    if (!this.subscriptions.has(task.chainId)) {
      console.log('>> QueryMultiWrapper: Add chain and API entry.');

      this.subscriptions.set(task.chainId, {
        unsub: null,
        callEntries: [newEntry],
      });

      return;
    }

    console.log('>> QueryMultiWrapper: Update with new API entry.');

    // Otherwise update query multi subscriptions map.
    const entry = this.subscriptions.get(task.chainId);

    if (entry) {
      // Add entry to chain's query multi.
      this.subscriptions.set(task.chainId, {
        unsub: entry.unsub,
        callEntries: [
          // Copy existing call entries.
          ...entry.callEntries.map((e: ApiCallEntry) => ({
            ...e,
            task: {
              ...e.task,
              actionArgs: e.task.actionArgs
                ? [...e.task.actionArgs]
                : undefined,
            },
          })),
          // Append new call entry.
          newEntry,
        ],
      });
    }
  }

  /**
   * @name remove
   * @summary Unsubscribe from query multi and remove a subscription task.
   * @param chainId - Target chain to remove subscription task from.
   * @param action - The subscription task to remove's action string.
   */
  remove(chainId: ChainID, action: string) {
    if (!this.actionExists(chainId, action)) {
      console.log(">> API call doesn't exist.");
    } else {
      // Remove action from query multi map.
      const entry = this.subscriptions.get(chainId)!;

      // Unsubscribe from current query multi.
      entry.unsub();

      // Remove task from entry.
      const updated: QueryMultiEntry = {
        unsub: entry.unsub,
        callEntries: entry.callEntries.filter((e) => e.task.action !== action),
      };

      // Update chain's query multi entry.
      this.subscriptions.set(chainId, updated);

      if (updated.callEntries.length === 0) {
        this.subscriptions.delete(chainId);
      }
    }
  }

  // --------------------------------------------------
  // Utils
  // --------------------------------------------------

  /**
   * @name setChainTaskVal
   * @summary Cache a new value for a specific API call entry (subscription task).
   */
  private setChainTaskVal(
    entry: ApiCallEntry,
    newVal: AnyData,
    chainId: ChainID
  ) {
    const retrieved = this.subscriptions.get(chainId);

    if (retrieved) {
      const newEntries = retrieved.callEntries.map((e) =>
        e.task.action === entry.task.action ? { ...e, curVal: newVal } : e
      );

      this.subscriptions.set(chainId, {
        unsub: retrieved.unsub,
        callEntries: newEntries,
      });
    }
  }

  /**
   * @name getChainTaskCurrentVal
   * @summary Get the cached value for a specific API call entry (subscription task).
   */
  private getChainTaskCurrentVal(action: string, chainId: ChainID) {
    const entry = this.subscriptions.get(chainId);
    if (entry) {
      for (const { task: t, curVal } of entry.callEntries) {
        if (t.action === action) {
          return curVal;
        }
      }
    }
    return null;
  }

  /**
   * @name replaceUnsub
   * @summary Replace the `unsub` function for a target chain's query multi call.
   */
  private replaceUnsub(chainId: ChainID, newUnsub: AnyFunction) {
    const entry = this.subscriptions.get(chainId)!;

    // Unsubscribe from pervious query multi.
    if (entry.unsub !== null) {
      entry.unsub();
    }

    this.subscriptions.set(chainId, {
      unsub: newUnsub,
      callEntries: [...entry!.callEntries],
    });
  }

  /**
   * @name buildQueryMultiArg
   * @summary Dynamically build the query multi argument by iterating the target chain's call entries (subscription tasks).
   */
  private buildQueryMultiArg(chainId: ChainID) {
    const argument: AnyData = [];

    const entry = this.subscriptions.get(chainId);

    if (entry) {
      for (const { apiCall, task } of entry.callEntries) {
        let callArray = [apiCall];

        if (task.actionArgs) {
          callArray = callArray.concat(task.actionArgs);
        }

        argument.push(callArray);
      }
    }

    return argument;
  }

  /**
   * @name actionExists
   * @summary Check if a chain is already subscribed to an action.
   */
  private actionExists(chainId: ChainID, action: string) {
    const entry = this.subscriptions.get(chainId);

    return Boolean(entry?.callEntries.some((e) => e.task.action === action));
  }

  // --------------------------------------------------
  // Callbacks (TODO: Move to static class)
  // --------------------------------------------------

  /**
   * @name callback_query_timestamp_now
   * @summary Callback for 'subscribe:query.timestamp.now'.
   */
  private callback_query_timestamp_now(data: AnyData, entry: ApiCallEntry) {
    const { action, chainId } = entry.task;
    const timeBuffer = 20;

    const newVal = new BigNumber(data);
    const curVal = new BigNumber(this.getChainTaskCurrentVal(action, chainId));

    // Return if value hasn't changed since last callback or time buffer hasn't passed.
    if (compareHashes(newVal, curVal) || newVal.minus(curVal).lte(timeBuffer)) {
      return;
    }

    // Cache new value.
    this.setChainTaskVal(entry, newVal, chainId);

    // Debugging.
    const now = new Date(data * 1000).toDateString();
    console.log(`Now: ${now} | ${data}`);

    // Construct and send event to renderer.
    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:new',
      EventsController.getEvent(entry, String(newVal))
    );
  }

  /**
   * @name callback_query_babe_currentSlot
   * @summary Callback for 'subscribe:query.babe.currentSlot'.
   */
  private callback_query_babe_currentSlot(data: AnyData, entry: ApiCallEntry) {
    const { action, chainId } = entry.task;
    const newVal = new BigNumber(data);
    const curVal = this.getChainTaskCurrentVal(action, chainId);

    // Return if value hasn't changed since last callback.
    if (compareHashes(newVal, curVal)) {
      return;
    }

    // Cache new value.
    this.setChainTaskVal(entry, newVal, chainId);

    // Debugging.
    console.log(`Current Sot: ${newVal}`);

    // Construct and send event to renderer.
    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:new',
      EventsController.getEvent(entry, String(newVal))
    );
  }

  /**
   * @name callback_query_system_account
   * @summary Callback for 'subscribe:query.system.account'.
   */
  private callback_query_system_account(data: AnyData, entry: ApiCallEntry) {
    const free = new BigNumber(data.data.free);
    const reserved = new BigNumber(data.data.reserved);
    const nonce = new BigNumber(data.nonce);

    // Debugging.
    console.log(
      `Account: Free balance is ${free} with ${reserved} reserved (nonce: ${nonce}).`
    );

    // Construct and send event to renderer.
    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:new',
      EventsController.getEvent(entry, {
        nonce,
        free,
        reserved,
      })
    );
  }

  /**
   * @name callback_nomination_pool_reward_account
   * @summary Callback for 'subscribe:nominationPools:query.system.account'.
   */
  private async callback_nomination_pool_reward_account(entry: ApiCallEntry) {
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
    WindowsController.get('menu')?.webContents?.send(
      'renderer:event:new',
      EventsController.getEvent(entry, {})
    );
  }
}
