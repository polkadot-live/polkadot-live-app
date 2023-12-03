import type { QueryMultiWrapper } from '@/model/QueryMultiWrapper';

export class SubscriptionsController {
  static globalSubscriptions: QueryMultiWrapper | null = null;

  static addGlobal(wrapper: QueryMultiWrapper) {
    SubscriptionsController.globalSubscriptions = wrapper;
  }
}
