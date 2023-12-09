import { QueryMultiWrapper } from '@/model/QueryMultiWrapper';
import type { ChainID } from '@/types/chains';
import type {
  SubscriptionNextStatus,
  SubscriptionTask,
} from '@/types/subscriptions';
import { store } from '@/main';
import { chainTasks as allChainTasks } from '@/config/chainTasks';

export class SubscriptionsController {
  static globalSubscriptions: QueryMultiWrapper | null = null;

  static addGlobal(wrapper: QueryMultiWrapper) {
    SubscriptionsController.globalSubscriptions = wrapper;
  }

  static async initGlobalSubscriptions() {
    // Instantiate QueryMultiWrapper.
    this.globalSubscriptions = new QueryMultiWrapper();

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
      await this.globalSubscriptions.subscribeTask(task);
    }
  }

  static async subscribeChainTask(task: SubscriptionTask) {
    await this.globalSubscriptions?.subscribeTask(task);
  }

  /*------------------------------------------------------------
   Return a map of all correctly configured tasks possible for
   a chain. Active subscriptions need to be included in the
   array.
   ------------------------------------------------------------*/

  static getChainSubscriptionTasks() {
    const activeTasks = this.globalSubscriptions?.getSubscriptionTasks();

    // TODO: Populate inactive tasks with their correct arguments.
    // No API calls so far require arguments.

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
