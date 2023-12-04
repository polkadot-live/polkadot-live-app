import { QueryMultiWrapper } from '@/model/QueryMultiWrapper';
import type { ChainID } from '@/types/chains';
import type {
  SubscriptionNextStatus,
  SubscriptionTask,
} from '@/types/subscriptions';
import { store } from '@/main';

export class SubscriptionsController {
  static globalSubscriptions: QueryMultiWrapper | null = null;

  static addGlobal(wrapper: QueryMultiWrapper) {
    SubscriptionsController.globalSubscriptions = wrapper;
  }

  static initGlobalSubscriptions() {
    // Instantiate QueryMultiWrapper.
    this.globalSubscriptions = new QueryMultiWrapper();

    // TODO: Replace with store.get('subscription_globals')
    const tasks: SubscriptionTask[] = [
      {
        action: 'subscribe:query.timestamp.now',
        chainId: 'Polkadot' as ChainID,
        status: 'enable' as SubscriptionNextStatus,
      },
      {
        action: 'subscribe:query.babe.currentSlot',
        chainId: 'Polkadot' as ChainID,
        status: 'enable' as SubscriptionNextStatus,
      },
    ];

    // Subscribe to tasks.
    for (const task of tasks) {
      this.globalSubscriptions.subscribeTask(task);
    }
  }

  /* Key naming convention of subscription tasks in store:

    'subscriptions_global'
      Key that stores global chain subscription tasks.

    'subscriptions_<account_address>'
      Key that stores an account's subscription tasks.
     
    Ex: const serialized = store.get('subscriptions_global');

    When subscription tasks are retrieved and deserialised,
    they can be passed to the appropriate `QueryMultiWrapper`
    instance, where the API call will be re-built.
  */

  // TODO: Call when frontend is able to add subscriptions.
  static persistTasksToStore(key: string, tasks: SubscriptionTask[]) {
    store.set(key, JSON.stringify(tasks));
  }
}
