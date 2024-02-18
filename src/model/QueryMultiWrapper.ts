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
  // Cache subscriptions are associated by their chain.
  private subscriptions = new Map<ChainID, QueryMultiEntry>();

  /**
   * @name requiresApiInstanceForChain
   * @summary Returns `true` if an API instance is required for the provided chain ID for this wrapper, and `false` otherwise.
   * @returns {boolean} Represents if API instance is required for the provided chainID.
   */
  requiresApiInstanceForChain(chainId: ChainID) {
    return this.subscriptions.has(chainId);
  }

  /*-------------------------------------------------- 
   Accessors
   --------------------------------------------------*/

  getSubscriptionTasks() {
    const result: SubscriptionTask[] = [];

    for (const entry of this.subscriptions.values()) {
      for (const { task } of entry.callEntries) {
        result.push({ ...task });
      }
    }

    return result;
  }

  /*-------------------------------------------------- 
   Helpers
   --------------------------------------------------*/

  // --------------------------------------------------
  // build
  // --------------------------------------------------

  // Dynamically re-call queryMulti based on the query multi map.
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

    const unsub = await instance.api.queryMulti(
      finalArg,
      async (data: AnyData) => {
        /*--------------------------------
         The Chain's queryMulti Callback
         -------------------------------*/

        // Work out task to handle
        const { callEntries } = this.subscriptions.get(chainId)!;

        for (const [index, entry] of callEntries.entries()) {
          const { action } = entry.task;

          switch (action) {
            /// Get the timestamp of the target chain and render it as
            /// a notification on the frontend.
            case 'subscribe:query.timestamp.now': {
              const newVal = new BigNumber(data[index]);
              const curVal = new BigNumber(
                this.getChainTaskCurrentVal(action, chainId)
              );

              // If the difference of newVal - curVal is lte
              // to this buffer, skip event processing.
              // Prevents "double" timestamps being rendered.
              const timeBuffer = 20;

              if (
                !data[index] ||
                compareHashes(newVal, curVal) ||
                newVal.minus(curVal).lte(timeBuffer)
              ) {
                break;
              }

              // Cache new value.
              this.setChainTaskVal(entry, newVal, chainId);

              // Debugging.
              const now = new Date(data[index] * 1000).toDateString();
              console.log(`Now: ${now} | ${data[index]} (index: ${index})`);

              // Construct and send event to renderer.
              WindowsController.get('menu')?.webContents?.send(
                'renderer:event:new',
                EventsController.getEvent(entry, String(newVal))
              );

              break;
            }

            /// Get the current slot of the target chain and render it as
            /// a notification on the frontend.
            case 'subscribe:query.babe.currentSlot': {
              const newVal = new BigNumber(data[index]);
              const curVal = this.getChainTaskCurrentVal(action, chainId);

              if (!data[index] || compareHashes(newVal, curVal)) {
                break;
              }

              // Cache new value.
              this.setChainTaskVal(entry, newVal, chainId);

              // Debugging.
              console.log(`Current Sot: ${newVal} (index: ${index})`);

              // Construct and send event to renderer.
              WindowsController.get('menu')?.webContents?.send(
                'renderer:event:new',
                EventsController.getEvent(entry, String(newVal))
              );

              break;
            }

            /// Get the balance of the task target account on the target chain.
            /// Returns the balance's nonce, free and reserved values.
            case 'subscribe:query.system.account': {
              const free = new BigNumber(data[index].data.free);
              const reserved = new BigNumber(data[index].data.reserved);
              const nonce = new BigNumber(data[index].nonce);

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

              break;
            }

            /// When a nomination pool free balance changes, check that the subscribed account's
            /// pending rewards has changed. If pending rewards have changed, send a notification
            /// to inform the user.
            case 'subscribe:nominationPools:query.system.account': {
              const flattenedAccount = entry.task.account;

              if (!flattenedAccount) {
                console.log('> Error getting flattened account data');
                break;
              }

              // Get account instance from controller.
              const account = AccountsController.get(
                chainId,
                flattenedAccount.address
              );

              // Fetch API instance.
              const { api } = await ApiUtils.getApiInstance(chainId);

              // Return if nomination pool data for account not found.
              if (!account?.nominationPoolData) {
                break;
              }

              // Get pool ID and reward address.
              const { poolPendingRewards } = account.nominationPoolData;

              // Get pending rewards for the account.
              const pendingRewardsResult =
                await api.call.nominationPoolsApi.pendingRewards(
                  account.address
                );

              const fetchedPendingRewards = planckToUnit(
                new BigNumber(pendingRewardsResult.toString()),
                chainUnits(chainId)
              );

              // Return if pending rewards has not changed for the account.
              if (fetchedPendingRewards.eq(poolPendingRewards)) {
                break;
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

              break;
            }
          }
        }
      }
    );

    // Replace the entry's unsub function
    this.replaceUnsub(chainId, unsub);
  }

  // --------------------------------------------------
  // insert
  // --------------------------------------------------

  // Insert a polkadot api function into queryMulti.
  insert(task: SubscriptionTask, apiCall: AnyFunction) {
    // Return if api call already exists.
    if (this.actionExists(task.chainId, task.action)) {
      console.log('>> QueryMultiWrapper: Action already exists.');
      return;
    }

    // Construct new ApiCallEntry.
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

  // --------------------------------------------------
  // remove
  // --------------------------------------------------

  // Unsubscribe from query multi if chain has no more entries.
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
  // Util: setChainTaskVal
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Util: getChainTaskCurrentVal
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Util: replaceUnsub
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Util: buildQueryMultiArg
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Util: actionExists
  // --------------------------------------------------

  // Check if a chain is already subscribed to an action.
  private actionExists(chainId: ChainID, action: string) {
    const entry = this.subscriptions.get(chainId);

    return Boolean(entry?.callEntries.some((e) => e.task.action === action));
  }
}
