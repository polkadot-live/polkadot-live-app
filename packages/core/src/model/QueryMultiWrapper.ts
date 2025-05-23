// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Callbacks from '../callbacks';
import * as Utils from '../library/CommonLib';
import { AccountsController, APIsController } from '../controllers';
import {
  getBalance,
  getNominationPoolData,
  getAccountNominatingData,
} from '../library/AccountsLib';

import type { Account } from './Account';
import type { AnyData, AnyFunction } from '@polkadot-live/types/misc';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { QueryWithParams } from 'dedot/types';
import type { DedotClientSet } from '@polkadot-live/types/apis';
import type {
  SubscriptionTask,
  QueryMultiEntry,
  ApiCallEntry,
  PostCallbackFlags,
} from '@polkadot-live/types/subscriptions';

export class QueryMultiWrapper {
  /**
   * API call entries (subscription tasks) are keyed by their chain ID.
   */
  private subscriptions = new Map<ChainID, QueryMultiEntry>();
  private queries = new Map<ChainID, QueryWithParams<AnyFunction>[]>();

  /**
   * Flag what data needs syncing after executing callbacks.
   */
  postCallbackSyncFlags: PostCallbackFlags = {
    syncAccountBalance: false,
    syncAccountNominationPool: false,
    syncAccountNominating: false,
  };

  /**
   * @name requiresChainApi
   * @summary Returns `true` if an API instance is required for the provided chain ID for this wrapper, and `false` otherwise.
   * @returns {boolean} Represents if API instance is required for the provided chainID.
   */
  requiresChainApi(chainId: ChainID): boolean {
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
   * @name setJustBuilt
   * @summary Update a task's `justBuilt` flag.
   */
  setJustBuilt(entry: ApiCallEntry, flag: boolean) {
    const { chainId, action } = entry.task;
    const retrieved = this.subscriptions.get(chainId);

    if (retrieved) {
      const newEntries = retrieved.callEntries.map((e) =>
        e.task.action === action
          ? ({
              ...e,
              task: { ...e.task, justBuilt: flag } as SubscriptionTask,
            } as ApiCallEntry)
          : e
      );

      this.subscriptions.set(chainId, {
        unsub: retrieved.unsub,
        callEntries: newEntries,
      });
    }
  }

  /**
   * @name handleCallback
   * @summary Main logic to handle entries (subscription tasks).
   */
  private async handleCallback(entry: ApiCallEntry, dataArr: AnyData) {
    type TupleArg = [AnyData, ApiCallEntry, PostCallbackFlags];
    const { action, justBuilt } = entry.task;
    const data = dataArr[entry.task.dataIndex!];
    const flags = this.postCallbackSyncFlags;
    const args: TupleArg = [data, entry, flags];

    // Exit early if the task was just built (toggled on).
    if (justBuilt) {
      this.setJustBuilt(entry, false);
      return;
    }

    switch (action) {
      case 'subscribe:chain:timestamp': {
        Callbacks.callback_query_timestamp_now(data, entry, this);
        break;
      }
      case 'subscribe:chain:currentSlot': {
        Callbacks.callback_query_babe_currentSlot(data, entry, this);
        break;
      }
      case 'subscribe:account:balance:free': {
        await Callbacks.callback_account_balance_free(...args);
        break;
      }
      case 'subscribe:account:balance:frozen': {
        await Callbacks.callback_account_balance_frozen(...args);
        break;
      }
      case 'subscribe:account:balance:reserved': {
        await Callbacks.callback_account_balance_reserved(...args);
        break;
      }
      case 'subscribe:account:balance:spendable': {
        await Callbacks.callback_account_balance_spendable(...args);
        break;
      }
      case 'subscribe:account:nominationPools:rewards': {
        await Callbacks.callback_nomination_pool_rewards(entry, flags);
        break;
      }
      case 'subscribe:account:nominationPools:state': {
        await Callbacks.callback_nomination_pool_state(...args);
        break;
      }
      case 'subscribe:account:nominationPools:renamed': {
        await Callbacks.callback_nomination_pool_renamed(...args);
        break;
      }
      case 'subscribe:account:nominationPools:roles': {
        await Callbacks.callback_nomination_pool_roles(...args);
        break;
      }
      case 'subscribe:account:nominationPools:commission': {
        await Callbacks.callback_nomination_pool_commission(...args);
        break;
      }
      case 'subscribe:account:nominating:pendingPayouts': {
        await Callbacks.callback_nominating_era_rewards(entry);
        break;
      }
      case 'subscribe:account:nominating:exposure': {
        await Callbacks.callback_nominating_exposure(...args);
        break;
      }
      case 'subscribe:account:nominating:commission': {
        await Callbacks.callback_nominating_commission(...args);
        break;
      }
      case 'subscribe:account:nominating:nominations': {
        await Callbacks.callback_nominating_nominations(...args);
        break;
      }
    }
  }

  /**
   * @name build
   * @summary Dynamically build the query multi argument, and make the actual API call.
   * @param {ChainID} chainId - The target chain to subscribe to.
   */
  async run(chainId: ChainID) {
    try {
      if (!this.subscriptions.get(chainId)) {
        console.log('🟠 queryMulti map is empty.');
        return;
      }

      const queries = this.queries.get(chainId);
      if (!queries) {
        throw new Error('Error - no built queries.');
      }
      const api = (
        await APIsController.getConnectedApiOrThrow(chainId)
      ).getApi();

      const unsub = await api.queryMulti(queries, async (data: AnyData) => {
        // Work out task to handle
        const { callEntries } = this.subscriptions.get(chainId)!;
        for (const entry of callEntries) {
          await this.handleCallback(entry, data);
        }

        // Update managed state after all callbacks processed.
        await this.postCallback(api, chainId, callEntries);
      });

      // Replace the entry's unsub function
      this.replaceUnsub(chainId, unsub);
    } catch (e) {
      console.error(e);
      // TODO: UI notification
    }
  }

  /**
   * @name postCallback
   * @summary Update managed state after processing all callbacks.
   */
  private postCallback = async (
    api: DedotClientSet,
    chainId: ChainID,
    callEntries: ApiCallEntry[]
  ) => {
    // Get the task's associated account.
    const firstEntry = callEntries.at(0);
    let account: Account | undefined = undefined;
    if (firstEntry !== undefined) {
      const { task } = firstEntry;
      const address = task.account ? task.account.address : null;
      address && (account = AccountsController.get(chainId, address));
    }

    if (account) {
      // Sync account balance.
      if (this.postCallbackSyncFlags.syncAccountBalance) {
        const { address, chain } = account;
        const balance = await getBalance(api, address, chain, false);
        account.balance = balance;
      }

      // Sync account nominating data.
      if (this.postCallbackSyncFlags.syncAccountNominating) {
        const result = await getAccountNominatingData(api, account);
        result && (account.nominatingData = result);
      }

      // Sync account nomination pool data.
      if (this.postCallbackSyncFlags.syncAccountNominationPool) {
        const result = await getNominationPoolData(account);
        result && (account.nominationPoolData = result);
      }

      // Set updated account data in the appropriate entries.
      for (const entry of callEntries) {
        if (entry.task.account) {
          entry.task.account = account.flatten();
        }
      }

      // Update managed account data.
      await AccountsController.set(account.chain, account);

      // Reset flags.
      this.postCallbackSyncFlags = {
        syncAccountBalance: false,
        syncAccountNominating: false,
        syncAccountNominationPool: false,
      };
    }
  };

  /**
   * @name updateEntryAccountData
   * @summary Updated cached flattened account data after processing a one-shot.
   */
  updateEntryAccountData = (
    chainId: ChainID,
    flattened: FlattenedAccountData
  ) => {
    const maybeSubscriptions = this.subscriptions.get(chainId);
    if (!maybeSubscriptions) {
      return;
    }

    const { callEntries } = maybeSubscriptions;
    for (const entry of callEntries) {
      if (entry.task.account) {
        entry.task.account = flattened;
      }
    }
  };

  /**
   * @name insert
   * @summary Add an `ApiCallEntry` to be managed by this wrapper.
   * @param {SubscriptionTask} task - Subscription task associated with entry.
   */
  insert(task: SubscriptionTask) {
    // Return if API call already exists.
    if (this.actionExists(task.chainId, task.action)) {
      console.log('🟠 Action already exists.');
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
      console.log('🔷 Add chain and API entry.');

      this.subscriptions.set(task.chainId, {
        unsub: null,
        callEntries: [newEntry],
      });

      return;
    }

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
      console.log("🟠 API call doesn't exist.");
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
   * @name setOsNotificationsFlag
   * @summary Set the enableOsNotifications for a task.
   */
  setOsNotificationsFlag(task: SubscriptionTask) {
    const { chainId, enableOsNotifications } = task;
    const chainEntry = this.subscriptions.get(chainId);

    if (chainEntry) {
      this.subscriptions.set(chainId, {
        unsub: chainEntry.unsub,
        callEntries: chainEntry.callEntries.map((e) =>
          e.task.action === task.action
            ? {
                ...e,
                task: { ...e.task, enableOsNotifications },
              }
            : e
        ),
      });
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
    if (entry.unsub !== null && typeof entry.unsub === 'function') {
      entry.unsub();
    }

    this.subscriptions.set(chainId, {
      unsub: newUnsub,
      callEntries: [...entry!.callEntries],
    });
  }

  /**
   * @name build
   * @summary Dynamically build the query multi argument by iterating the target chain's call entries (subscription tasks).
   */
  async build(chainId: ChainID) {
    // An array of arrays. The inner array represents a single API call.
    const queries: QueryWithParams<AnyFunction>[] = [];
    const entry: QueryMultiEntry | undefined = this.subscriptions.get(chainId);

    if (!entry) {
      this.queries.set(chainId, queries);
      return;
    }

    // Data index registry tracks the entry index and its associated data index.
    interface RegistryPair {
      entryIndex: number;
      dataIndex: number;
    }

    // First entry is always going to have dataIndex of 0.
    const dataIndexRegistry: RegistryPair[] = [];

    // Util: Get next registry index.
    const getNextRegistryIndex = (): number =>
      dataIndexRegistry.length === 0
        ? 0
        : dataIndexRegistry.reduce(
            (acc, { dataIndex }) => (dataIndex > acc ? dataIndex : acc),
            0
          ) + 1;

    // Util: Check if tasks can share an API call.
    const tasksCanShare = (a: SubscriptionTask, b: SubscriptionTask) => {
      const isSameQuery = a.apiCallAsString === b.apiCallAsString;
      const isSameArgs = Utils.arraysAreEqual(
        a.actionArgs || [],
        b.actionArgs || []
      );
      return isSameQuery && isSameArgs;
    };

    // Set each task's dataIndex.
    const iterable = entry.callEntries;
    for (const [i, { task }] of iterable.entries()) {
      // Re-iterate entries up to outerI and check for shared api calls.
      for (const [j, { task: innerT }] of iterable.entries()) {
        if (i === j) {
          const nextIndex = getNextRegistryIndex();
          task.dataIndex = nextIndex;

          dataIndexRegistry.push({
            entryIndex: i,
            dataIndex: nextIndex,
          });

          const apiCall: AnyFunction = await QueryMultiWrapper.getApiCall(task);
          const args = QueryMultiWrapper.parseActionArgs(task) || [];
          queries.push({ fn: apiCall, args });
          break;
        } else if (tasksCanShare(task, innerT)) {
          task.dataIndex = innerT.dataIndex;

          dataIndexRegistry.push({
            entryIndex: i,
            dataIndex: innerT.dataIndex!,
          });
          break;
        }
      }
    }

    console.log('debug: data index registry:');
    console.log(dataIndexRegistry);

    // Get updated entries with correct `dataIndex` for each task and set `justBuilt` flag.
    const updatedEntries = entry.callEntries.map((e, i) => {
      const { entryIndex, dataIndex } = dataIndexRegistry[i];
      if (entryIndex !== i) {
        throw new Error("indices don't match");
      }
      e.task.dataIndex = dataIndex;
      e.task.justBuilt = true;
      return e;
    });

    // Cache queries.
    this.queries.set(chainId, queries);
    this.subscriptions.set(chainId, {
      ...entry,
      callEntries: [...updatedEntries],
    });
  }

  /**
   * @name actionExists
   * @summary Check if a chain is already subscribed to an action.
   */
  private actionExists(chainId: ChainID, action: string) {
    const entry = this.subscriptions.get(chainId);

    return Boolean(entry?.callEntries.some((e) => e.task.action === action));
  }

  /**
   * @name getApiQuery
   * @summary Get the API query associated with a subscription.
   */
  static async getApiCall(task: SubscriptionTask): Promise<AnyData> {
    const { action, chainId } = task;
    const api = (await APIsController.getConnectedApiOrThrow(chainId)).getApi();

    switch (action) {
      case 'subscribe:chain:timestamp':
        return api.query.timestamp.now;
      case 'subscribe:chain:currentSlot':
        return api.query.babe.currentSlot;
      case 'subscribe:account:balance:free':
      case 'subscribe:account:balance:frozen':
      case 'subscribe:account:balance:reserved':
      case 'subscribe:account:balance:spendable':
      case 'subscribe:account:nominationPools:rewards':
        return api.query.system.account;
      case 'subscribe:account:nominationPools:commission':
      case 'subscribe:account:nominationPools:roles':
      case 'subscribe:account:nominationPools:state':
        return api.query.nominationPools.bondedPools;
      case 'subscribe:account:nominationPools:renamed':
        return api.query.nominationPools.metadata;
      case 'subscribe:account:nominating:commission':
      case 'subscribe:account:nominating:exposure':
      case 'subscribe:account:nominating:nominations':
      case 'subscribe:account:nominating:pendingPayouts':
        return api.query.staking.activeEra;
      default:
        throw new Error('Subscription action not found');
    }
  }

  /**
   * @name parseActionArgs
   * @summary Parse serialized args into correct data types for API arguments.
   */
  static parseActionArgs = (task: SubscriptionTask) => {
    const { action, actionArgs: args } = task;
    if (!args) {
      return args;
    }

    switch (action) {
      case 'subscribe:account:balance:free':
      case 'subscribe:account:balance:frozen':
      case 'subscribe:account:balance:reserved':
      case 'subscribe:account:balance:spendable': {
        const address: string = args[0];
        return [address];
      }
      case 'subscribe:account:nominationPools:rewards': {
        const poolAddress: string = args[0];
        return [poolAddress];
      }
      case 'subscribe:account:nominationPools:state':
      case 'subscribe:account:nominationPools:roles':
      case 'subscribe:account:nominationPools:commission':
      case 'subscribe:account:nominationPools:renamed': {
        return [Number(args[0])];
      }
      case 'subscribe:account:nominating:commission':
      case 'subscribe:account:nominating:exposure':
      case 'subscribe:account:nominating:nominations':
      case 'subscribe:account:nominating:pendingPayouts': {
        return args;
      }
      default: {
        return args;
      }
    }
  };
}
