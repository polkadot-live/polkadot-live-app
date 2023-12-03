import { Subject } from 'rxjs';
import type { ChainID } from '@/types/chains';
import type { AnyFunction } from '@polkadot-cloud/react/types';
import type { AnyData } from '@/types/misc';
import type { QueryableStorageMultiArg } from '@polkadot/api/types';
import BigNumber from 'bignumber.js';
import * as ApiUtils from '@/utils/ApiUtils';

/*-------------------------------------------------- 
 Types
 --------------------------------------------------*/

export type SubscriptionNextStatus = 'enable' | 'disable';

export interface SubscriptionTask {
  action: string;
  actionArgs?: string[];
  chainId: ChainID;
  status: SubscriptionNextStatus;
}

export interface ApiCallEntry {
  action: string;
  actionArgs?: string[];
  apiCall: AnyFunction;
  curVal: AnyData | null;
}

// TODO: May need to store api isntance reference.
export interface QueryMultiEntry {
  callEntries: ApiCallEntry[];
  unsub: AnyFunction | null;
}

/*-------------------------------------------------- 
 Static Class 
 --------------------------------------------------*/

export class SubscriptionsController {
  /*-------------------------------------------------- 
   Initialization
   --------------------------------------------------*/

  // Subject receiving tasks.
  private static manager = new Subject<SubscriptionTask>();

  // Cache subscriptions associated their chain.
  private static queryMultiSubscriptions: Map<ChainID, QueryMultiEntry> =
    new Map();

  static initialize() {
    console.log('>> Subscriptions controller initialize called.');

    this.manager.subscribe({
      next: async (task) => {
        switch (task.action) {
          case 'subscribe:query.timestamp.now': {
            console.log('subscribe timestamp now');
            await this.subscribe_query_timestamp_now(task);
            break;
          }

          case 'subscribe:query.babe.currentSlot': {
            console.log('subscribe babe currentSlot');
            await this.subscribe_query_babe_currentSlot(task);
            break;
          }

          default: {
            throw new Error('Subscription action not found');
          }
        }
      },
    });
  }

  // Wrapper around calling subject's next method.
  static performTask(task: SubscriptionTask) {
    console.log('>> Perform task called.');
    this.manager.next(task);
  }

  // Unsubscribe subject.
  static destroy() {
    this.manager.unsubscribe();
  }

  /*-------------------------------------------------- 
   Helpers
   --------------------------------------------------*/

  // --------------------------------------------------
  // buildQueryMulti
  // --------------------------------------------------

  // Dynamically re-call queryMulti based on the query multi map.
  private static async buildQueryMulti(chainId: ChainID) {
    if (this.queryMultiSubscriptions.size === 0) {
      console.log('>> queryMulti map is empty.');
      return;
    }

    // Construct the argument for new queryMulti call.
    const queryMultiArg: AnyData = this.buildQueryMultiArg(chainId);

    // Unsubscribe from previous queryMulti if exists.
    const prevUnsub = this.queryMultiSubscriptions.get(chainId)?.unsub;
    if (prevUnsub !== null) {
      prevUnsub();
    }

    // Make the new call to queryMulti.
    console.log('>> Make call to queryMulti.');

    const instance = await ApiUtils.getApiInstance(chainId);
    const finalArg = queryMultiArg as QueryableStorageMultiArg<'promise'>[];

    const unsub = await instance.api.queryMulti(finalArg, (data: AnyData) => {
      /*--------------------------------
       The Chain's queryMulti Callback
       -------------------------------*/

      // Work out task to handle
      const { callEntries } = this.queryMultiSubscriptions.get(chainId)!;

      for (const [index, entry] of callEntries.entries()) {
        const { action } = entry;

        switch (action) {
          case 'subscribe:query.timestamp.now': {
            const newVal = new BigNumber(data[index]);
            const curVal = this.getActionCallbackVal(action, chainId);

            // TODO: Compare hashes instead of string
            if (curVal && curVal.toString() === newVal.toString()) break;

            this.setActionCallbackVal(entry, newVal, chainId);

            const now = new Date(data[index] * 1000).toDateString();
            console.log(`Now: ${now} | ${data[index]} (index: ${index})`);

            break;
          }
          case 'subscribe:query.babe.currentSlot': {
            const currentSlot = new BigNumber(data[1]);
            const curVal = this.getActionCallbackVal(action, chainId);

            // TODO: Compare hashes instead of string
            if (
              !data[index] ||
              (curVal && curVal.toString() === currentSlot.toString())
            ) {
              break;
            }

            this.setActionCallbackVal(entry, currentSlot, chainId);

            console.log(`Current Sot: ${currentSlot} (index: ${index})`);
            break;
          }
        }
      }
    });

    // Cache the unsub function
    this.setUnsub(chainId, unsub);
  }

  // --------------------------------------------------
  // insertIntoQueryMulti
  // --------------------------------------------------

  // Insert a polkadot api function into queryMulti
  private static insertIntoQueryMulti(
    task: SubscriptionTask,
    apiCall: AnyFunction
  ) {
    // Return if api call already exists.
    if (this.actionExistsInQueryMulti(task.chainId, task.action)) {
      console.log('>> API call already exists.');
      return;
    }

    // Construct new ApiCallEntry.
    const newEntry: ApiCallEntry = {
      action: task.action,
      actionArgs: task.actionArgs,
      apiCall,
      curVal: null,
    };

    // Insert new key if chain isn't cached yet.
    if (!this.queryMultiSubscriptions.has(task.chainId)) {
      console.log('>> Add chain and API entry to queryMulti map.');

      this.queryMultiSubscriptions.set(task.chainId, {
        unsub: null,
        callEntries: [newEntry],
      });

      return;
    }

    console.log('>> Update queryMulti map with new API entry.');

    // Otherwise update query multi map.
    const entry = this.queryMultiSubscriptions.get(task.chainId);

    if (entry) {
      // Add entry to chain's query multi.
      this.queryMultiSubscriptions.set(task.chainId, {
        unsub: entry.unsub,
        callEntries: [...entry.callEntries, newEntry],
      });
    }
  }

  // --------------------------------------------------
  // removeFromQueryMulti
  // --------------------------------------------------

  // Unsubscribe from query multi if chain has no more entries.
  private static removeFromQueryMulti(chainId: ChainID, action: string) {
    if (this.actionExistsInQueryMulti(chainId, action)) {
      console.log(">> API call doesn't exist.");
      return;
    }

    // Flag to signal an unsubscription.
    let unsubFromChain: boolean = false;

    // Remove action from query multi map.
    const entry = this.queryMultiSubscriptions.get(chainId);

    if (entry) {
      // Remove task from entry.
      const updated: QueryMultiEntry = {
        unsub: entry.unsub,
        callEntries: entry.callEntries.filter((e) => e.action !== action),
      };

      // Mark chain for unsubscription.
      if (updated.callEntries.length === 0) unsubFromChain = true;

      // Update chain's query multi entry.
      this.queryMultiSubscriptions.set(chainId, updated);
    }

    // Handle chain unsubscription if necessary and delete chain from map.
    if (unsubFromChain) {
      this.unsubAndRemoveMultiQuery(chainId);
    }
  }

  // --------------------------------------------------
  // Util: setActionCallbackVal
  // --------------------------------------------------

  private static setActionCallbackVal(
    entry: ApiCallEntry,
    newVal: AnyData,
    chainId: ChainID
  ) {
    const retrieved = this.queryMultiSubscriptions.get(chainId);

    if (retrieved) {
      const newEntries = retrieved.callEntries.map((e) => {
        return e.action === entry.action ? { ...e, curVal: newVal } : e;
      });

      this.queryMultiSubscriptions.set(chainId, {
        unsub: retrieved.unsub,
        callEntries: newEntries,
      });
    }
  }

  // --------------------------------------------------
  // Util: getActionCallbackVal
  // --------------------------------------------------

  private static getActionCallbackVal(action: string, chainId: ChainID) {
    const entry = this.queryMultiSubscriptions.get(chainId);
    if (entry) {
      for (const { action: a, curVal } of entry.callEntries) {
        if (a === action) {
          return curVal;
        }
      }
    }
    return null;
  }

  // --------------------------------------------------
  // Util: setUnsub
  // --------------------------------------------------

  private static setUnsub(chainId: ChainID, unsub: AnyFunction) {
    const entry = this.queryMultiSubscriptions.get(chainId);

    if (entry) {
      this.queryMultiSubscriptions.set(chainId, {
        unsub,
        callEntries: [...entry!.callEntries],
      });
    }
  }

  // --------------------------------------------------
  // Util: buildQueryMultiArg
  // --------------------------------------------------

  private static buildQueryMultiArg(chainId: ChainID) {
    const queryMultiArg: AnyData = [];

    const entry = this.queryMultiSubscriptions.get(chainId);

    if (entry) {
      for (const { apiCall, actionArgs } of entry.callEntries) {
        let callArray = [apiCall];

        if (actionArgs) callArray = callArray.concat(actionArgs);

        queryMultiArg.push(callArray);
      }
    }

    return queryMultiArg;
  }

  // --------------------------------------------------
  // Util: unsubAndRemoveMultiQuery
  // --------------------------------------------------

  private static unsubAndRemoveMultiQuery(chainId: ChainID) {
    this.queryMultiSubscriptions.get(chainId)?.unsub();

    if (this.queryMultiSubscriptions.delete(chainId)) {
      console.log(`Query multi unsubscribed for ${chainId}`);
    }
  }

  // --------------------------------------------------
  // Util: actionExistsInQueryMulti
  // --------------------------------------------------

  // Check if a chain is already subscribed to an action.
  private static actionExistsInQueryMulti(chainId: ChainID, action: string) {
    const entry = this.queryMultiSubscriptions.get(chainId);

    if (entry) {
      for (const metadata of entry.callEntries) {
        if (metadata.action === action) return true;
      }
    }

    return false;
  }

  // --------------------------------------------------
  // Util: handleTask
  // --------------------------------------------------

  private static handleTask(task: SubscriptionTask, apiCall: AnyFunction) {
    switch (task.status) {
      // Add this action to the chain's subscriptions.
      case 'enable': {
        this.insertIntoQueryMulti(task, apiCall);
        this.buildQueryMulti(task.chainId);
        break;
      }
      // Remove this action from the chain's subscriptions.
      case 'disable': {
        this.removeFromQueryMulti(task.chainId, task.action);
        this.buildQueryMulti(task.chainId);
        break;
      }
    }
  }

  /*-------------------------------------------------- 
   Handlers
   --------------------------------------------------*/

  // api.query.timestamp.now
  private static async subscribe_query_timestamp_now(task: SubscriptionTask) {
    switch (task.chainId) {
      case 'Polkadot': {
        try {
          console.log('>> Rebuild queryMulti');
          const instance = await ApiUtils.getApiInstance(task.chainId);
          this.handleTask(task, instance.api.query.timestamp.now);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  // api.query.babe.currentSlot
  private static async subscribe_query_babe_currentSlot(
    task: SubscriptionTask
  ) {
    switch (task.chainId) {
      case 'Polkadot': {
        try {
          console.log('>> Rebuild queryMulti');
          const instance = await ApiUtils.getApiInstance(task.chainId);
          this.handleTask(task, instance.api.query.babe.currentSlot);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
