import BigNumber from 'bignumber.js';
import * as ApiUtils from '@/utils/ApiUtils';
import { EventsController } from '@/controller/EventsController';
import { WindowsController } from '@/controller/WindowsController';
import type { ChainID } from '@/types/chains';
import type { AnyData, AnyFunction } from '@/types/misc';
import type { ApiPromise } from '@polkadot/api';
import type {
  SubscriptionTask,
  QueryMultiEntry,
  ApiCallEntry,
} from '@/types/subscriptions';
import { compareHashes } from '@/utils/CryptoUtils';

export class QueryMultiWrapper {
  // Cache subscriptions are associated by their chain.
  private subscriptions = new Map<ChainID, QueryMultiEntry>();

  private async next(task: SubscriptionTask) {
    switch (task.action) {
      case 'subscribe:query.timestamp.now': {
        console.log('subscribe timestamp now');
        await QueryMultiWrapper.subscribe_query_timestamp_now(task, this);
        break;
      }

      case 'subscribe:query.babe.currentSlot': {
        console.log('subscribe babe currentSlot');
        await QueryMultiWrapper.subscribe_query_babe_currentSlot(task, this);
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
  }

  // Wrapper around calling subject's next method.
  async subscribeTask(task: SubscriptionTask) {
    await this.next(task);
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
  private async build(chainId: ChainID) {
    if (!this.subscriptions.get(chainId)) {
      console.log('>> QueryMultiWrapper: queryMulti map is empty.');
      return;
    }

    // Construct the argument for new queryMulti call.
    const queryMultiArg: AnyData = this.buildQueryMultiArg(chainId);

    // Make the new call to queryMulti.
    console.log('>> QueryMultiWrapper: Call to queryMulti.');

    const instance = await ApiUtils.getApiInstance(chainId);
    const finalArg = queryMultiArg as ApiPromise;

    const unsub = await instance.api.queryMulti(finalArg, (data: AnyData) => {
      /*--------------------------------
       The Chain's queryMulti Callback
       -------------------------------*/

      // Work out task to handle
      const { callEntries } = this.subscriptions.get(chainId)!;

      for (const [index, entry] of callEntries.entries()) {
        const { action } = entry.task;

        switch (action) {
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
        }
      }
    });

    // Replace the entry's unsub function
    this.replaceUnsub(chainId, unsub);
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

    // Otherwise update query multi map.
    const entry = this.subscriptions.get(task.chainId);

    if (entry) {
      // Add entry to chain's query multi.
      this.subscriptions.set(task.chainId, {
        unsub: entry.unsub,
        callEntries: [
          ...entry.callEntries.map((e: ApiCallEntry) => ({
            ...e,
            actionArgs: e.task.actionArgs ? [...e.task.actionArgs] : undefined,
          })),
          newEntry,
        ],
      });
    }
  }

  // --------------------------------------------------
  // remove
  // --------------------------------------------------

  // Unsubscribe from query multi if chain has no more entries.
  private remove(chainId: ChainID, action: string) {
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
  // Util: setActionCallbackVal
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
  // Util: getActionCallbackVal
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
  // Util: setUnsub
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

  // --------------------------------------------------
  // Util: handleTask
  // --------------------------------------------------

  private async handleTask(task: SubscriptionTask, apiCall: AnyFunction) {
    switch (task.status) {
      // Add this action to the chain's subscriptions.
      case 'enable': {
        this.insert(task, apiCall);
        await this.build(task.chainId);
        break;
      }
      // Remove this action from the chain's subscriptions.
      case 'disable': {
        this.remove(task.chainId, task.action);
        await this.build(task.chainId);
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
          await wrapper.handleTask(task, instance.api.query.timestamp.now);
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
          await wrapper.handleTask(task, instance.api.query.babe.currentSlot);
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
          await wrapper.handleTask(task, instance.api.query.system.account);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
