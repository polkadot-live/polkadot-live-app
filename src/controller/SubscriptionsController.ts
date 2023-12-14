import { QueryMultiWrapper } from '@/model/QueryMultiWrapper';
import type { ChainID } from '@/types/chains';
import type {
  SubscriptionNextStatus,
  SubscriptionTask,
} from '@/types/subscriptions';
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
    // Instantiate QueryMultiWrapper.
    this.chainSubscriptions = new QueryMultiWrapper();

    // TODO: Replace with store.get('subscription_globals')
    const tasks: SubscriptionTask[] = [
      {
        action: 'subscribe:query.timestamp.now',
        actionArgs: undefined,
        chainId: 'Polkadot' as ChainID,
        status: 'enable' as SubscriptionNextStatus,
        label: 'Timestamps',
      },
    ];

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
  
   'subscriptions_global'
     Key that stores global chain subscription tasks.
  
   'subscriptions_<account_address>'
     Key that stores an account's subscription tasks.
  
   Ex: const serialized = store.get('subscriptions_global');
  
   When subscription tasks are retrieved and deserialised,
   they can be passed to the appropriate `QueryMultiWrapper`
   instance, where the API call will be re-built.
   ------------------------------------------------------------*/

  // TODO: Call when frontend is able to add subscriptions.
  static persistTasksToStore(key: string, tasks: SubscriptionTask[]) {
    store.set(key, JSON.stringify(tasks));
  }
}
