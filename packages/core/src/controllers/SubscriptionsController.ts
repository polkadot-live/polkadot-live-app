// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { QueryMultiWrapper } from '../model/QueryMultiWrapper';
import { TaskOrchestrator } from '../orchestrators/TaskOrchestrator';
import { AccountsController } from '../controllers';
import { accountTasks } from '@polkadot-live/consts/subscriptions/account';
import { chainTasks } from '@polkadot-live/consts/subscriptions/chain';
import { compareTasks } from '../library';
import type { Account } from '../model';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  SubscriptionTask,
  WrappedSubscriptionTasks,
} from '@polkadot-live/types/subscriptions';

/**
 * Key naming convention of subscription tasks in store:
 *
 * 'chain_subscriptions'
 *   Key that stores global chain subscription tasks.
 *
 * '<account_address>_subscriptions'
 *   Key that stores an account's subscription tasks.
 *
 * Ex: const serialized = store.get('chain_subscriptions');
 *
 * When subscription tasks are retrieved and deserialised,
 * they can be passed to the `TaskOrchestrator`, where the API
 * call will be re-built.
 */

export class SubscriptionsController {
  static backend: 'browser' | 'electron';
  static chainSubscriptions = new QueryMultiWrapper();

  /**
   * React state.
   */
  static setChainSubscriptions: React.Dispatch<
    React.SetStateAction<Map<ChainID, SubscriptionTask[]>>
  >;

  static setAccountSubscriptions: React.Dispatch<
    React.SetStateAction<Map<string, SubscriptionTask[]>>
  >;

  static setRenderedSubscriptionsState: React.Dispatch<
    React.SetStateAction<WrappedSubscriptionTasks>
  >;

  /**
   * Sync react state with managed controller data.
   */
  static syncState = () => {
    if (this.backend === 'electron') {
      this.syncChainSubscriptionsState();
      this.syncAccountSubscriptionsState();
    } else {
      // TODO: Sync React state for extension.
    }
  };

  static syncChainSubscriptionsState = () => {
    const data = this.getChainSubscriptions();
    this.setChainSubscriptions(data);
  };

  static syncAccountSubscriptionsState = () => {
    const data = this.getAccountSubscriptions();
    this.setAccountSubscriptions(data);
  };

  /**
   * Update task caches.
   */
  static updateTaskState = (task: SubscriptionTask) => {
    task.action.startsWith('subscribe:account')
      ? this.updateAccountTaskState(task)
      : this.updateChainTaskState(task);
  };

  private static updateAccountTaskState = (task: SubscriptionTask) => {
    const { address, chain } = task.account!;
    const key = `${chain}:${address}`;

    if (this.backend === 'electron') {
      this.setAccountSubscriptions((prev) => {
        const tasks = prev.get(key);
        const val = !tasks
          ? [{ ...task }]
          : tasks.map((t) => (compareTasks(task, t) ? task : t));
        return prev.set(key, val);
      });
      this.updateRendererdTask(task);
    } else if (this.backend === 'browser') {
      // TODO: Update React account task state.
    }
  };

  private static updateChainTaskState = (task: SubscriptionTask) => {
    const key = task.chainId;
    if (this.backend === 'electron') {
      this.setChainSubscriptions((prev) => {
        const tasks = prev.get(key)!;
        const val = tasks.map((t) => (compareTasks(task, t) ? task : t));
        return prev.set(key, val);
      });
      this.updateRendererdTask(task);
    } else if (this.backend === 'browser') {
      // TODO: Update React chain tasks state.
    }
  };

  static updateRendererdTask = (task: SubscriptionTask) => {
    this.setRenderedSubscriptionsState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (compareTasks(task, t) ? task : t)),
    }));
  };

  /**
   * @name initChainSubscriptions
   * @summary Fetch and build persisted chain subscription tasks from store.
   */
  static async initChainSubscriptions() {
    let serialized = '';
    if (this.backend === 'electron') {
      // Send IPC message to get chain tasks from store.
      serialized =
        (await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:chain:getAll',
          data: null,
        })) || '';
    } else {
      // TODO: Get chain tasks from database.
    }

    // Subscribe to tasks.
    await TaskOrchestrator.buildTasks(
      serialized !== '' ? JSON.parse(serialized) : [],
      this.chainSubscriptions
    );
  }

  /**
   * @name resubscribeChains
   * @summary Run managed chain subscriptions. Called when the app goes into online mode.
   */
  static async resubscribeChains() {
    const tasks = this.chainSubscriptions.getSubscriptionTasks() || [];
    await TaskOrchestrator.subscribeTasks(tasks, this.chainSubscriptions);
  }

  /**
   * @name resubscribeChain
   * @summary Re-subscribe to tasks for a particular chain.
   */
  static async resubscribeChain(chainId: ChainID) {
    const tasks = this.chainSubscriptions
      .getSubscriptionTasks()
      .filter((task) => task.chainId === chainId);

    await TaskOrchestrator.subscribeTasks(tasks, this.chainSubscriptions);
  }

  /**
   * @name subscribeChainTasks
   * @summary Subscribe to a batch of chain tasks.
   */
  static async subscribeChainTasks(tasks: SubscriptionTask[]) {
    await TaskOrchestrator.subscribeTasks(tasks, this.chainSubscriptions);
  }

  /**
   * @name requiresChainApi
   * @summary Returns `true` if an API instance is required for the provided chain ID for this wrapper, and `false` otherwise.
   * @returns {boolean} Represents if API instance is required for the provided chainID.
   */
  static requiresChainApi(chainId: ChainID) {
    return this.chainSubscriptions.requiresChainApi(chainId);
  }

  /**
   * @name getChainSubscriptions
   * @summary Return a map of all correctly configured tasks possible for
   * a chain. Active subscriptions need to be included in the array.
   */
  static getChainSubscriptions() {
    const activeTasks = this.chainSubscriptions.getSubscriptionTasks();

    // TODO: Populate inactive tasks with their correct arguments.
    // No chain API calls so far require arguments.

    // Merge active tasks into default tasks array.
    const allTasks = activeTasks
      ? chainTasks.map((t) => {
          for (const active of activeTasks) {
            if (active.action === t.action && active.chainId === t.chainId) {
              return active;
            }
          }
          return t;
        })
      : chainTasks;

    // Construct map from tasks array.
    const map = new Map<ChainID, SubscriptionTask[]>();

    for (const task of allTasks) {
      let updated = [task];

      const current = map.get(task.chainId);
      if (current) {
        updated = [...current, task];
      }

      map.set(task.chainId, updated);
    }

    return map;
  }

  /**
   * @name getAccountSubscriptions
   * @summary Return a map of all correctly configured tasks possible for the received accounts.
   * Active subscriptions need to be included in the array.
   */
  static getAccountSubscriptions() {
    const result = new Map<string, SubscriptionTask[]>();

    for (const accounts of AccountsController.accounts.values()) {
      for (const a of accounts) {
        const tasks = accountTasks
          // Filter on account's chain ID.
          .filter((t) => t.chainId === a.chain)
          // Fill task arguments.
          .map((t) => this.getTaskArgsForAccount(a, t))
          // Merge active tasks.
          .map(
            (t) =>
              (a.getSubscriptionTasks() || []).find(
                (next) => next.action === t.action && next.chainId === t.chainId
              ) || t
          );

        result.set(`${a.chain}:${a.address}`, tasks);
      }
    }

    return result;
  }

  /**
   * @name enableAllSubscriptionsForAccount
   * @summary Activate all subscriptions when an account is imported.
   */
  static getAllSubscriptionsForAccount = (
    account: Account,
    status: 'enable' | 'disable'
  ) =>
    accountTasks
      .filter((t) => t.chainId === account.chain)
      .map((t) => this.getTaskArgsForAccount(account, t))
      .map((t) => ({ ...t, status }) as SubscriptionTask);

  /**
   * @name getTaskArgsForAccount
   * @summary Populate a task with correct arguments for an account.
   */
  static getTaskArgsForAccount = (
    account: Account,
    taskTemplate: SubscriptionTask
  ) => {
    const task = {
      ...taskTemplate,
      account: account.flatten(),
    } as SubscriptionTask;

    switch (task.action) {
      case 'subscribe:account:balance:free':
      case 'subscribe:account:balance:frozen':
      case 'subscribe:account:balance:reserved':
      case 'subscribe:account:balance:spendable': {
        return { ...task, actionArgs: [account.address] } as SubscriptionTask;
      }
      case 'subscribe:account:nominationPools:rewards': {
        const actionArgs = account.nominationPoolData
          ? [account.nominationPoolData.poolRewardAddress]
          : undefined;

        return { ...task, actionArgs } as SubscriptionTask;
      }
      case 'subscribe:account:nominationPools:state':
      case 'subscribe:account:nominationPools:renamed':
      case 'subscribe:account:nominationPools:roles':
      case 'subscribe:account:nominationPools:commission': {
        const actionArgs = account.nominationPoolData
          ? [account.nominationPoolData.poolId]
          : undefined;

        return { ...task, actionArgs } as SubscriptionTask;
      }
      default: {
        return task;
      }
    }
  };
}
