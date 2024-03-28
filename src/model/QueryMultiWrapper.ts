// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Callbacks } from '@/renderer/callbacks';
import { MainDebug } from '@/utils/DebugUtils';
import { TaskOrchestrator } from '@/orchestrators/TaskOrchestrator';
import type { ChainID } from '@/types/chains';
import type { AnyData, AnyFunction } from '@/types/misc';
import type {
  SubscriptionTask,
  QueryMultiEntry,
  ApiCallEntry,
} from '@/types/subscriptions';
import * as ApiUtils from '@/utils/ApiUtils';

const debug = MainDebug.extend('QueryMultiWrapper');

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
   * @name setChainTaskVal
   * @summary Cache a new value for a specific API call entry (subscription task).
   */
  setChainTaskVal(entry: ApiCallEntry, newVal: AnyData, chainId: ChainID) {
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
  getChainTaskCurrentVal(action: string, chainId: ChainID) {
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
          case 'subscribe:query.timestamp.now': {
            Callbacks.callback_query_timestamp_now(dataArr[index], entry, this);
            break;
          }
          case 'subscribe:query.babe.currentSlot': {
            Callbacks.callback_query_babe_currentSlot(
              dataArr[index],
              entry,
              this
            );
            break;
          }
          case 'subscribe:query.system.account': {
            Callbacks.callback_query_system_account(
              dataArr[index],
              entry,
              this
            );
            break;
          }
          case 'subscribe:nominationPools:query.system.account': {
            await Callbacks.callback_nomination_pool_reward_account(entry);
            break;
          }
          case 'subscribe:nominationPoolState:query.nominationPools.bondedPools': {
            await Callbacks.callback_nomination_pool_state(
              dataArr[index],
              entry
            );
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
      debug('🟠 queryMulti map is empty.');
      return;
    }

    // Construct the argument for new queryMulti call.
    const queryMultiArg: AnyData = await this.buildQueryMultiArg(chainId);

    const instance = await ApiUtils.getApiInstance(chainId);
    const finalArg = queryMultiArg;

    // Make the new call to queryMulti.
    debug('🔷 Call to api.queryMulti.');

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
   */
  insert(task: SubscriptionTask) {
    // Return if API call already exists.
    if (this.actionExists(task.chainId, task.action)) {
      debug('🟠 Action already exists.');
      return;
    }

    // Construct new `ApiCallEntry`.
    const newEntry: ApiCallEntry = {
      curVal: null,
      task: {
        ...task,
        actionArgs: task.actionArgs ? [...task.actionArgs] : undefined,
      },
    };

    // Insert new key if chain isn't cached yet.
    if (!this.subscriptions.has(task.chainId)) {
      debug('🔷 Add chain and API entry.');

      this.subscriptions.set(task.chainId, {
        unsub: null,
        callEntries: [newEntry],
      });

      return;
    }

    debug('🔷 Update with new API entry.');

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
      debug("🟠 API call doesn't exist.");
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

  /**
   * @name unsubOnly
   * @summary Unsubscribe from the wrapped queryMulti but keep the cached call entries.
   * This method is called when the app goes into offline mode.
   */
  unsubOnly() {
    for (const { unsub } of this.subscriptions.values()) {
      // TODO: Might be clearer if the entry's `unsub` field is also set to `null`.
      unsub();
    }
  }

  /**
   * Utils
   */

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
  private async buildQueryMultiArg(chainId: ChainID) {
    const argument: AnyData = [];

    const entry = this.subscriptions.get(chainId);

    if (entry) {
      for (const { task } of entry.callEntries) {
        const apiCall = await TaskOrchestrator.getApiCall(task);
        let callArray: AnyData[] = [apiCall];

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
}
