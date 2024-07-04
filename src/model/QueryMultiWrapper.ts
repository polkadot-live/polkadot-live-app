// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
  requiresApiInstanceForChain(chainId: ChainID): boolean {
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
  private async handleCallback(
    entry: ApiCallEntry,
    dataArr: AnyData,
    chainId: ChainID
  ) {
    const { action, justBuilt } = entry.task;

    // Exit early if the task was just built (toggled on).
    if (justBuilt) {
      this.setJustBuilt(entry, false);
      return;
    }

    switch (action) {
      case 'subscribe:chain:timestamp': {
        Callbacks.callback_query_timestamp_now(
          dataArr[entry.task.dataIndex!],
          entry,
          this
        );
        break;
      }
      case 'subscribe:chain:currentSlot': {
        Callbacks.callback_query_babe_currentSlot(
          dataArr[entry.task.dataIndex!],
          entry,
          this
        );
        break;
      }
      case 'subscribe:account:balance': {
        await Callbacks.callback_query_system_account(
          dataArr[entry.task.dataIndex!],
          entry
        );
        break;
      }
      case 'subscribe:account:balance:frozen': {
        await Callbacks.callback_account_balance_frozen(
          dataArr[entry.task.dataIndex!],
          entry
        );
        break;
      }
      case 'subscribe:account:nominationPools:rewards': {
        await Callbacks.callback_nomination_pool_rewards(entry);
        break;
      }
      case 'subscribe:account:nominationPools:state': {
        await Callbacks.callback_nomination_pool_state(
          dataArr[entry.task.dataIndex!],
          entry
        );
        break;
      }
      case 'subscribe:account:nominationPools:renamed': {
        await Callbacks.callback_nomination_pool_renamed(
          dataArr[entry.task.dataIndex!],
          entry
        );
        break;
      }
      case 'subscribe:account:nominationPools:roles': {
        await Callbacks.callback_nomination_pool_roles(
          dataArr[entry.task.dataIndex!],
          entry
        );
        break;
      }
      case 'subscribe:account:nominationPools:commission': {
        await Callbacks.callback_nomination_pool_commission(
          dataArr[entry.task.dataIndex!],
          entry
        );
        break;
      }
      case 'subscribe:account:nominating:pendingPayouts': {
        switch (chainId) {
          case 'Polkadot':
          case 'Kusama': {
            await Callbacks.callback_nominating_pending_payouts(
              dataArr[entry.task.dataIndex!],
              entry
            );
            break;
          }
          case 'Westend': {
            await Callbacks.callback_nominating_pending_payouts(
              dataArr[entry.task.dataIndex!],
              entry
            );
            break;
          }
        }
        break;
      }
      case 'subscribe:account:nominating:exposure': {
        switch (chainId) {
          case 'Polkadot':
          case 'Kusama': {
            await Callbacks.callback_nominating_exposure(
              dataArr[entry.task.dataIndex!],
              entry
            );
            break;
          }
          case 'Westend': {
            await Callbacks.callback_nominating_exposure_westend(
              dataArr[entry.task.dataIndex!],
              entry
            );
            break;
          }
        }
        break;
      }
      case 'subscribe:account:nominating:commission': {
        await Callbacks.callback_nominating_commission(
          dataArr[entry.task.dataIndex!],
          entry
        );
        break;
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
      console.log('🟠 queryMulti map is empty.');
      return;
    }

    // Construct the argument for new queryMulti call.
    const finalArg: AnyData = await this.buildQueryMultiArg(chainId);
    const origin = 'QueryMultiWrapper.build';
    const instance = await ApiUtils.getApiInstanceOrThrow(chainId, origin);

    // Call queryMulti api.
    const unsub = await instance.api.queryMulti(
      finalArg,
      // The queryMulti callback.
      async (data: AnyData) => {
        // Work out task to handle
        const { callEntries } = this.subscriptions.get(chainId)!;

        for (const entry of callEntries) {
          await this.handleCallback(entry, data, chainId);
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
    // An array of arrays. The inner array represents a single API call.
    const argument: AnyData = [];
    const entry: QueryMultiEntry | undefined = this.subscriptions.get(chainId);

    if (!entry) {
      return argument;
    }

    // Data index registry tracks the entry index and its associated data index.
    interface RegistryPair {
      entryIndex: number;
      dataIndex: number;
    }

    // First entry is always going to have dataIndex of 0.
    const dataIndexRegistry: RegistryPair[] = [{ entryIndex: 0, dataIndex: 0 }];

    // Set each task's dataIndex.
    for (const [outerI, { task }] of entry.callEntries.entries()) {
      if (outerI === 0) {
        // First task in the array cannot share with previous tasks.
        const apiCall: AnyFunction = await TaskOrchestrator.getApiCall(task);

        const callArray: AnyData[] = task.actionArgs
          ? [apiCall].concat([...task.actionArgs])
          : [apiCall];

        argument.push(callArray);
        continue;
      }

      // Re-iterate entries up to outerI and check for shared api calls.
      for (const [innerI, { task: innerT }] of entry.callEntries.entries()) {
        if (innerI === outerI) {
          // No shared call found. Increment by 1 to get next data index.
          const nextDataIndex =
            dataIndexRegistry.reduce(
              (acc, { dataIndex }) => (dataIndex > acc ? dataIndex : acc),
              0
            ) + 1;

          task.dataIndex = nextDataIndex;
          dataIndexRegistry.push({
            entryIndex: outerI,
            dataIndex: nextDataIndex,
          });

          const apiCall: AnyFunction = await TaskOrchestrator.getApiCall(task);
          const callArray: AnyData[] = task.actionArgs
            ? [apiCall].concat([...task.actionArgs])
            : [apiCall];

          argument.push(callArray);
          break;
        } else {
          // Check for shared call.
          if (task.apiCallAsString === innerT.apiCallAsString) {
            // Share if calls are the same with no args.
            if (!task.actionArgs && !innerT.actionArgs) {
              task.dataIndex = innerT.dataIndex;

              dataIndexRegistry.push({
                entryIndex: outerI,
                dataIndex: innerT.dataIndex!,
              });
              break;
            } else {
              // Check if action args are equal.
              const outerHasArgs = task.actionArgs !== undefined;
              const innerHasArgs = innerT.actionArgs !== undefined;

              // Share api call if they both have no arguments.
              if (!outerHasArgs && !innerHasArgs) {
                task.dataIndex = innerT.dataIndex;

                dataIndexRegistry.push({
                  entryIndex: outerI,
                  dataIndex: innerT.dataIndex!,
                });
                break;
              }

              // Not equal if one has args and the other doesn't.
              if (
                (outerHasArgs && !innerHasArgs) ||
                (!outerHasArgs && innerHasArgs)
              ) {
                continue;
              }

              // Otherwise, check if action args are the same.
              if (
                ApiUtils.arraysAreEqual(task.actionArgs!, innerT.actionArgs!)
              ) {
                task.dataIndex = innerT.dataIndex;

                dataIndexRegistry.push({
                  entryIndex: outerI,
                  dataIndex: innerT.dataIndex!,
                });
                break;
              }

              // Continue if api calls are equal but the action args are not equal.
              continue;
            }
          } else {
            // Continue of api calls are not equal.
            continue;
          }
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

    this.subscriptions.set(chainId, {
      ...entry,
      callEntries: [...updatedEntries],
    });

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
