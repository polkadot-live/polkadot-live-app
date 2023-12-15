import { QueryMultiWrapper } from '@/model/QueryMultiWrapper';
import type { ChainID } from '@/types/chains';
import type { SubscriptionTask } from '@/types/subscriptions';
import { store } from '@/main';
import { chainTasks as allChainTasks } from '@/config/chainTasks';
import { accountTasks as allAccountTasks } from '@/config/accountTasks';
import type { Account, ImportedAccounts } from '@/model/Account';

export class SubscriptionsController {
  static chainSubscriptions: QueryMultiWrapper | null = null;

  static addGlobal(wrapper: QueryMultiWrapper) {
    SubscriptionsController.chainSubscriptions = wrapper;
  }

  static async initChainSubscriptions() {
    const key = 'chain_subscriptions';

    // Instantiate QueryMultiWrapper.
    this.chainSubscriptions = new QueryMultiWrapper();

    // Get and deserialize chain tasks from store.
    const tasks: SubscriptionTask[] = store.get(key)
      ? JSON.parse(store.get(key) as string)
      : [];

    // Subscribe to tasks.
    for (const task of tasks) {
      await this.chainSubscriptions.subscribeTask(task);
    }
  }

  /*------------------------------------------------------------
   Subscribe to a chain task received from the renderer.
   ------------------------------------------------------------*/

  static async subscribeChainTask(task: SubscriptionTask) {
    await this.chainSubscriptions?.subscribeTask(task);
  }

  /*------------------------------------------------------------
   Subscribe to an account task received from the renderer.
   ------------------------------------------------------------*/

  static async subscribeAccountTask(task: SubscriptionTask, account: Account) {
    await account.subscribeToTask(task);
  }

  /*------------------------------------------------------------
   Return a map of all correctly configured tasks possible for
   a chain. Active subscriptions need to be included in the
   array.
   ------------------------------------------------------------*/

  static getChainSubscriptions() {
    const activeTasks = this.chainSubscriptions?.getSubscriptionTasks();

    // TODO: Populate inactive tasks with their correct arguments.
    // No chain API calls so far require arguments.

    // Merge active tasks into default tasks array.
    const allTasks = activeTasks
      ? allChainTasks.map((t) => {
          for (const active of activeTasks) {
            if (active.action === t.action && active.chainId === t.chainId)
              return active;
          }
          return t;
        })
      : allChainTasks;

    // Construct map from tasks array.
    const map: Map<ChainID, SubscriptionTask[]> = new Map();

    for (const task of allTasks) {
      let updated = [task];

      const current = map.get(task.chainId);
      if (current) updated = [...current, task];

      map.set(task.chainId, updated);
    }

    return map;
  }

  /*------------------------------------------------------------
   Return a map of all correctly configured tasks possible for
   an account. Active subscriptions need to be included in the
   array.
   ------------------------------------------------------------*/

  static getAccountSubscriptions(accountsMap: ImportedAccounts) {
    const map: Map<string, SubscriptionTask[]> = new Map();

    for (const accounts of accountsMap.values()) {
      for (const account of accounts) {
        const activeTasks = account.getSubscriptionTasks();

        // Tasks need to be populated with their correct arguments
        // before being sent to the renderer.
        const allTasksWithArgs = allAccountTasks.map((t) => {
          switch (t.action) {
            case 'subscribe:query.system.account': {
              return {
                ...t,
                actionArgs: [account.address],
              };
            }
            default: {
              return t;
            }
          }
        });

        // Merge inactive and active tasks.
        const allTasks = activeTasks
          ? allTasksWithArgs.map((t) => {
              for (const active of activeTasks) {
                if (
                  active.action === t.action &&
                  active.chainId === t.chainId
                ) {
                  return active;
                }
              }
              return t;
            })
          : allTasksWithArgs;

        map.set(account.address, allTasks);
      }
    }

    return map;
  }

  /*------------------------------------------------------------
   Key naming convention of subscription tasks in store:
  
   'chain_subscriptions'
     Key that stores global chain subscription tasks.
  
   '<account_address>_subscriptions'
     Key that stores an account's subscription tasks.
  
   Ex: const serialized = store.get('chain_subscriptions');
  
   When subscription tasks are retrieved and deserialised,
   they can be passed to the appropriate `QueryMultiWrapper`
   instance, where the API call will be re-built.
   ------------------------------------------------------------*/

  // Called when a chain subscription task is received from renderer.
  static updateChainTaskInStore(task: SubscriptionTask) {
    const key = 'chain_subscriptions';

    // Deserialize all tasks from store.
    const tasks: SubscriptionTask[] = store.get(key)
      ? JSON.parse(store.get(key) as string)
      : [];

    this.updateTaskInStore(tasks, task, key);
  }

  // Called when an account subscription task is received from renderer.
  static updateAccountTaskInStore(task: SubscriptionTask, account: Account) {
    const key = `${account.address}_subscriptions`;

    // Deserialize the account's tasks from store.
    const tasks: SubscriptionTask[] = store.get(key)
      ? JSON.parse(store.get(key) as string)
      : [];

    this.updateTaskInStore(tasks, task, key);
  }

  /*------------------------------------------------------------
   Clears an account's persisted subscriptions in the store.
   Invoked when an account is removed.
   ------------------------------------------------------------*/

  static clearAccountTasksInStore(account: Account) {
    store.delete(`${account.address}_subscriptions`);
  }

  /*------------------------------------------------------------
   Utilities
   ------------------------------------------------------------*/

  private static updateTaskInStore(
    tasks: SubscriptionTask[],
    task: SubscriptionTask,
    key: string
  ) {
    // Add or remove task depending on its status.
    if (task.status === 'enable') {
      // Remove task from array if it already exists.
      this.taskExistsInArray(tasks, task) &&
        (tasks = this.removeTaskFromArray(tasks, task));

      tasks.push(task);
    } else {
      tasks = tasks.filter(
        (t) => !(t.action === task.action && t.chainId === task.chainId)
      );
    }

    // Persist new array to store.
    store.set(key, JSON.stringify(tasks));
  }

  private static taskExistsInArray(
    tasks: SubscriptionTask[],
    task: SubscriptionTask
  ) {
    return tasks.some(
      (t) => t.action === task.action && t.chainId === t.chainId
    );
  }

  private static removeTaskFromArray(
    tasks: SubscriptionTask[],
    task: SubscriptionTask
  ) {
    return tasks.filter(
      (t) => !(t.action === task.action && t.chainId === task.chainId)
    );
  }
}
