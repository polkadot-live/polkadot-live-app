import { Subject } from 'rxjs';
import BigNumber from 'bignumber.js';
import * as ApiUtils from '@/utils/ApiUtils';
import type { ChainID } from '@/types/chains';
import type { AnyData, AnyFunction } from '@/types/misc';
import type { QueryableStorageMultiArg } from '@polkadot/api/types';
import type {
  SubscriptionTask,
  QueryMultiEntry,
  ApiCallEntry,
} from '@/types/subscriptions';
import { compareHashes } from '@/utils/CryptoUtils';

export class QueryMultiWrapper {
  // RxJS Subject receiving tasks.
  private manager = new Subject<SubscriptionTask>();

  // Cache subscriptions associated their chain.
  private subscriptions: Map<ChainID, QueryMultiEntry> = new Map();

  constructor(tasks?: SubscriptionTask[]) {
    this.initialize();

    if (tasks) {
      for (const task of tasks) {
        this.subscribeTask(task);
      }
    }
  }

  private initialize() {
    console.log('>> QueryMultiWrapper: initialize');

    this.manager.subscribe({
      next: async (task) => {
        switch (task.action) {
          case 'subscribe:query.timestamp.now': {
            console.log('subscribe timestamp now');
            await QueryMultiWrapper.subscribe_query_timestamp_now(task, this);
            break;
          }

          case 'subscribe:query.babe.currentSlot': {
            console.log('subscribe babe currentSlot');
            await QueryMultiWrapper.subscribe_query_babe_currentSlot(
              task,
              this
            );
            break;
          }

          case 'subscribe:query.system.account': {
            console.log('subscribe account balance');
            await QueryMultiWrapper.subscribe_query_system_account(task, this);
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
  subscribeTask(task: SubscriptionTask) {
    this.manager.next(task);
  }

  // Unsubscribe subject.
  destroy() {
    this.manager.unsubscribe();
  }

  /*-------------------------------------------------- 
   Helpers
   --------------------------------------------------*/

  // --------------------------------------------------
  // build
  // --------------------------------------------------

  // Dynamically re-call queryMulti based on the query multi map.
  private async build(chainId: ChainID) {
    if (this.subscriptions.size === 0) {
      console.log('>> QueryMultiWrapper: queryMulti map is empty.');
      return;
    }

    // Construct the argument for new queryMulti call.
    const queryMultiArg: AnyData = this.buildQueryMultiArg(chainId);

    // Unsubscribe from previous queryMulti if exists.
    const prevUnsub = this.subscriptions.get(chainId)?.unsub;
    if (prevUnsub !== null) {
      prevUnsub();
    }

    // Make the new call to queryMulti.
    console.log('>> QueryMultiWrapper: Call to queryMulti.');

    const instance = await ApiUtils.getApiInstance(chainId);
    const finalArg = queryMultiArg as QueryableStorageMultiArg<'promise'>[];

    const unsub = await instance.api.queryMulti(finalArg, (data: AnyData) => {
      /*--------------------------------
       The Chain's queryMulti Callback
       -------------------------------*/

      // Work out task to handle
      const { callEntries } = this.subscriptions.get(chainId)!;

      for (const [index, entry] of callEntries.entries()) {
        const { action } = entry;

        switch (action) {
          case 'subscribe:query.timestamp.now': {
            const newVal = new BigNumber(data[index]);
            const curVal = this.getActionCallbackVal(action, chainId);

            if (compareHashes(newVal, curVal)) break;

            this.setActionCallbackVal(entry, newVal, chainId);

            const now = new Date(data[index] * 1000).toDateString();
            console.log(`Now: ${now} | ${data[index]} (index: ${index})`);

            break;
          }
          case 'subscribe:query.babe.currentSlot': {
            const newVal = new BigNumber(data[index]);
            const curVal = this.getActionCallbackVal(action, chainId);

            if (!data[index] || compareHashes(newVal, curVal)) break;

            this.setActionCallbackVal(entry, newVal, chainId);
            console.log(`Current Sot: ${newVal} (index: ${index})`);

            break;
          }
          case 'subscribe:query.system.account': {
            const free = new BigNumber(data[index].data.free);
            const reserved = new BigNumber(data[index].data.reserved);
            const nonce = data[index].nonce;

            console.log(
              `Account: Free balance is ${free} with ${reserved} reserved (nonce: ${nonce}).`
            );

            break;
          }
        }
      }
    });

    // Cache the unsub function
    this.setUnsub(chainId, unsub);
  }

  // --------------------------------------------------
  // insert
  // --------------------------------------------------

  // Insert a polkadot api function into queryMulti
  private insert(task: SubscriptionTask, apiCall: AnyFunction) {
    // Return if api call already exists.
    if (this.actionExists(task.chainId, task.action)) {
      console.log('>> QueryMultiWrapper: Action already exists.');
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
    if (!this.subscriptions.has(task.chainId)) {
      console.log('>> QueryMultiWrapper: Add chain and API entry.');

      this.subscriptions.set(task.chainId, {
        unsub: null,
        callEntries: [newEntry],
      });

      return;
    }

    console.log('>> QueryMultiWrapper: Update with new API entry.');

    // Otherwise update query multi map.
    const entry = this.subscriptions.get(task.chainId);

    if (entry) {
      // Add entry to chain's query multi.
      this.subscriptions.set(task.chainId, {
        unsub: entry.unsub,
        callEntries: [...entry.callEntries, newEntry],
      });
    }
  }

  // --------------------------------------------------
  // remove
  // --------------------------------------------------

  // Unsubscribe from query multi if chain has no more entries.
  private remove(chainId: ChainID, action: string) {
    if (this.actionExists(chainId, action)) {
      console.log(">> API call doesn't exist.");
      return;
    }

    // Flag to signal an unsubscription.
    let unsubFromChain: boolean = false;

    // Remove action from query multi map.
    const entry = this.subscriptions.get(chainId);

    if (entry) {
      // Remove task from entry.
      const updated: QueryMultiEntry = {
        unsub: entry.unsub,
        callEntries: entry.callEntries.filter((e) => e.action !== action),
      };

      // Mark chain for unsubscription.
      if (updated.callEntries.length === 0) unsubFromChain = true;

      // Update chain's query multi entry.
      this.subscriptions.set(chainId, updated);
    }

    // Handle chain unsubscription if necessary and delete chain from map.
    if (unsubFromChain) {
      this.unsubAndRemoveChain(chainId);
    }
  }

  // --------------------------------------------------
  // Util: setActionCallbackVal
  // --------------------------------------------------

  private setActionCallbackVal(
    entry: ApiCallEntry,
    newVal: AnyData,
    chainId: ChainID
  ) {
    const retrieved = this.subscriptions.get(chainId);

    if (retrieved) {
      const newEntries = retrieved.callEntries.map((e) => {
        return e.action === entry.action ? { ...e, curVal: newVal } : e;
      });

      this.subscriptions.set(chainId, {
        unsub: retrieved.unsub,
        callEntries: newEntries,
      });
    }
  }

  // --------------------------------------------------
  // Util: getActionCallbackVal
  // --------------------------------------------------

  private getActionCallbackVal(action: string, chainId: ChainID) {
    const entry = this.subscriptions.get(chainId);
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

  private setUnsub(chainId: ChainID, unsub: AnyFunction) {
    const entry = this.subscriptions.get(chainId);

    if (entry) {
      this.subscriptions.set(chainId, {
        unsub,
        callEntries: [...entry!.callEntries],
      });
    }
  }

  // --------------------------------------------------
  // Util: buildQueryMultiArg
  // --------------------------------------------------

  private buildQueryMultiArg(chainId: ChainID) {
    const argument: AnyData = [];

    const entry = this.subscriptions.get(chainId);

    if (entry) {
      for (const { apiCall, actionArgs } of entry.callEntries) {
        let callArray = [apiCall];

        if (actionArgs) callArray = callArray.concat(actionArgs);

        argument.push(callArray);
      }
    }

    return argument;
  }

  // --------------------------------------------------
  // Util: unsubAndRemoveChain
  // --------------------------------------------------

  private unsubAndRemoveChain(chainId: ChainID) {
    this.subscriptions.get(chainId)?.unsub();

    if (this.subscriptions.delete(chainId)) {
      console.log(`QueryMultiWrapper: Unsubscribed for chain ${chainId}.`);
    }
  }

  // --------------------------------------------------
  // Util: actionExists
  // --------------------------------------------------

  // Check if a chain is already subscribed to an action.
  private actionExists(chainId: ChainID, action: string) {
    const entry = this.subscriptions.get(chainId);

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

  private handleTask(task: SubscriptionTask, apiCall: AnyFunction) {
    switch (task.status) {
      // Add this action to the chain's subscriptions.
      case 'enable': {
        this.insert(task, apiCall);
        this.build(task.chainId);
        break;
      }
      // Remove this action from the chain's subscriptions.
      case 'disable': {
        this.remove(task.chainId, task.action);
        this.build(task.chainId);
        break;
      }
    }
  }

  /*-------------------------------------------------- 
   Handlers
   --------------------------------------------------*/

  // api.query.timestamp.now
  private static async subscribe_query_timestamp_now(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    switch (task.chainId) {
      case 'Polkadot': {
        try {
          console.log('>> QueryMultiWrapper: Rebuild queryMulti');
          const instance = await ApiUtils.getApiInstance(task.chainId);
          wrapper.handleTask(task, instance.api.query.timestamp.now);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  // api.query.babe.currentSlot
  private static async subscribe_query_babe_currentSlot(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    switch (task.chainId) {
      case 'Polkadot': {
        try {
          console.log('>> QueryMultiWrapper: Rebuild queryMulti');
          const instance = await ApiUtils.getApiInstance(task.chainId);
          wrapper.handleTask(task, instance.api.query.babe.currentSlot);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  // api.query.system.account
  private static async subscribe_query_system_account(
    task: SubscriptionTask,
    wrapper: QueryMultiWrapper
  ) {
    switch (task.chainId) {
      case 'Polkadot': {
        try {
          console.log('>> QueryMultiWrapper: Rebuild queryMulti');
          const instance = await ApiUtils.getApiInstance(task.chainId);
          wrapper.handleTask(task, instance.api.query.system.account);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
