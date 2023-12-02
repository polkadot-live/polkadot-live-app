import { Subject } from 'rxjs';
import { APIsController } from './APIsController';
import type { ChainID } from '@/types/chains';
import type { AnyFunction } from '@polkadot-cloud/react/types';
import { ChainList } from '@/config/chains';
import type { AnyData } from '@/types/misc';
import type { QueryableStorageMultiArg } from '@polkadot/api/types';

/*-------------------------------------------------- 
 Types
 --------------------------------------------------*/

export type SubscriptionNextStatus = 'enable' | 'disable';

// TODO: Rename `args` to `actionArgs`
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
}

// TODO: May need to store api isntance reference.
export interface QueryMultiEntry {
  callEntries: ApiCallEntry[];
  unsub: AnyFunction;
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
  // rebuildQueryMulti
  // --------------------------------------------------

  // Dynamically rebuild queryMulti. Once the `queryMultiSubscriptions` map
  // is updated, the queryMulti can be re-subscribed.
  private static async rebuildQueryMulti(chainId: ChainID) {
    if (this.queryMultiSubscriptions.size === 0) {
      console.log('>> queryMulti map is empty.');
      return;
    }

    // Construct the argument for `queryMulti`.
    const queryMultiArg: AnyData = [];
    console.log('>> Construct queryMulti argument.');

    for (const [cid, callData] of this.queryMultiSubscriptions.entries()) {
      if (cid === chainId) {
        for (const { apiCall, actionArgs } of callData.callEntries) {
          let callArray = [apiCall];

          if (actionArgs) {
            callArray = callArray.concat(actionArgs);
          }

          queryMultiArg.push(callArray);
        }
      }
    }

    // Make the call to `queryMulti`.
    try {
      console.log('>> Make call to queryMulti.');

      const instance = await this.getApiInstance(chainId);
      const finalArg = queryMultiArg as QueryableStorageMultiArg<'promise'>[];

      const unsub = await instance.api.queryMulti(finalArg, (data: AnyData) => {
        // Work out task to handle
        const { callEntries } = this.queryMultiSubscriptions.get(chainId)!;

        const actions = callEntries.map((entry) => entry.action);

        for (const [index, action] of actions.entries()) {
          switch (action) {
            case 'subscribe:query.timestamp.now': {
              const now = new Date(data[index] * 1000).toDateString();
              console.log(`Now: ${now}`);

              break;
            }
            case 'subscribe:query.babe.currentSlot': {
              const currentSlot = data[index];

              currentSlot
                ? console.log(`Current Sot: ${data[index]}`)
                : console.log('Current Slot: Not received yet');

              break;
            }
          }
        }
      });

      // Cache the `unsub` function (TODO: Put in helper function)
      for (const [c, callData] of this.queryMultiSubscriptions.entries()) {
        if (c === chainId) {
          this.queryMultiSubscriptions.set(chainId, {
            unsub,
            callEntries: [...callData.callEntries],
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  // --------------------------------------------------
  // insertQueryMulti
  // --------------------------------------------------

  // Insert a polkadot api function into queryMulti
  private static insertQueryMulti(
    task: SubscriptionTask,
    apiCall: AnyFunction
  ) {
    // Return if api call already exists.
    if (this.apiCallExistsInQueryMulti(task)) {
      console.log('>> API call already exists.');
      return;
    }

    // Insert new key if chain isn't cached yet.
    if (!this.queryMultiSubscriptions.has(task.chainId)) {
      console.log('>> Add chain and API entry to queryMulti map.');

      this.queryMultiSubscriptions.set(task.chainId, {
        unsub: null,
        callEntries: [
          {
            action: task.action,
            actionArgs: task.actionArgs,
            apiCall,
          },
        ],
      });

      return;
    }

    console.log('>> Update queryMulti map with new API entry.');

    // Otherwise update query multi map.
    for (const [chainId, callData] of this.queryMultiSubscriptions) {
      if (chainId === task.chainId) {
        const newEntry: ApiCallEntry = {
          action: task.action,
          actionArgs: task.actionArgs,
          apiCall,
        };

        this.queryMultiSubscriptions.set(chainId, {
          unsub: callData.unsub,
          callEntries: [...callData.callEntries, newEntry],
        });
      }
    }
  }

  // --------------------------------------------------
  // removeQueryMulti
  // --------------------------------------------------

  // Unsubscribe from query multi if chain has no more entries.
  private static removeQueryMulti(task: SubscriptionTask) {
    const chainId = task.chainId;
    const action = task.action;

    if (this.apiCallExistsInQueryMulti(task)) {
      console.log(">> API call doesn't exist.");
      return;
    }

    // Remove action from query multi map
    let unsubFromChain: boolean = false;

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

    // Handle chain unsubscription if necessary.
    if (unsubFromChain) {
      this.queryMultiSubscriptions.get(chainId)?.unsub();

      if (this.queryMultiSubscriptions.delete(chainId)) {
        console.log(`Query multi unsubscribed for ${chainId}`);
      }
    }
  }

  // --------------------------------------------------
  // Utils
  // --------------------------------------------------

  // Get API instance (TODO: Put in another file)
  private static async getApiInstance(chainId: ChainID) {
    if (!APIsController.chainExists(chainId)) {
      await APIsController.new(ChainList.get(chainId)!.endpoints.rpc);
    }

    const instance = APIsController.get(chainId);

    if (!instance) {
      throw new Error(
        `SubscriptionsController: ${chainId} API instance couldn't be created`
      );
    }

    return instance;
  }

  // Check if query multi already contains a polkadot api function.
  private static apiCallExistsInQueryMulti(task: SubscriptionTask) {
    const entry = this.queryMultiSubscriptions.get(task.chainId);

    if (entry) {
      for (const metadata of entry.callEntries) {
        if (metadata.action === task.action) return true;
      }
    }

    return false;
  }

  /*-------------------------------------------------- 
   Handlers
   --------------------------------------------------*/

  // api.query.timestamp.now
  private static async subscribe_query_timestamp_now(task: SubscriptionTask) {
    switch (task.chainId) {
      case 'Polkadot': {
        try {
          console.log('Rebuild queryMulti (query.timestamp.now)');

          if (task.status === 'enable') {
            // Add subscription to query multi.
            const instance = await this.getApiInstance(task.chainId);

            this.insertQueryMulti(task, instance.api.query.timestamp.now);
            this.rebuildQueryMulti(task.chainId);
          } else {
            // TODO: Remove this subscription from query multi cache
          }

          console.log(task.status);
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
          console.log('Rebuild queryMulti (query.babe.currentSlot)');

          if (task.status === 'enable') {
            // Add subscription to query multi.
            const instance = await this.getApiInstance(task.chainId);

            this.insertQueryMulti(task, instance.api.query.babe.currentSlot);
            this.rebuildQueryMulti(task.chainId);
          } else {
            // TODO: Remove this subscription from query multi cache
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
