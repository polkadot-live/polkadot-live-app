// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import type { AnyData } from '@/types/misc';
import type { IntervalSubscription } from '@/types/subscriptions';
import type { IpcTask } from '@/types/communication';

export class IntervalsController {
  /**
   * @name process
   * @summary Process an interval subscription IPC task.
   */
  static process(task: IpcTask): string | void {
    switch (task.action) {
      case 'interval:task:add': {
        this.add(task);
        return;
      }
      case 'interval:task:clear': {
        return this.clear();
      }
      case 'interval:task:get': {
        return this.get();
      }
      case 'interval:task:remove': {
        this.remove(task);
        return;
      }
      case 'interval:task:update': {
        this.update(task);
        return;
      }
    }
  }

  /**
   * @name add
   * @summary Add interval subscription to store.
   */
  private static add(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyData> = store;

    const stored: IntervalSubscription[] = storePointer.get(key)
      ? JSON.parse(storePointer.get(key) as string)
      : [];

    stored.push(JSON.parse(serialized));
    storePointer.set(key, JSON.stringify(stored));
  }

  /**
   * @name clear
   * @summary Clear interval subscriptions from store.
   */
  private static clear(): string {
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyData> = store;
    storePointer.delete(key);
    return 'done';
  }

  /**
   * @name get
   * @summary Get serialized interval subscriptions from store.
   */
  private static get(): string {
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyData> = store;
    const stored: string = storePointer.get(key) || '[]';
    return stored;
  }

  /**
   * @name remove
   * @summary Remove interval subscription from store.
   */
  private static remove(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyData> = store;

    const stored: IntervalSubscription[] = storePointer.get(key)
      ? JSON.parse(storePointer.get(key) as string)
      : [];

    const target: IntervalSubscription = JSON.parse(serialized);
    const filtered = stored.filter(
      (t) =>
        !(
          t.action === target.action &&
          t.chainId === target.chainId &&
          t.referendumId === target.referendumId
        )
    );

    storePointer.set(key, JSON.stringify(filtered));
  }

  /**
   * @name update
   * @summary Update an interval subscription in the store.
   */
  private static update(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const key = 'interval_subscriptions';
    const storePointer: Record<string, AnyData> = store;

    const target: IntervalSubscription = JSON.parse(serialized);
    const stored: IntervalSubscription[] = storePointer.get(key)
      ? JSON.parse(storePointer.get(key) as string)
      : [];

    const updated = stored.map((t) =>
      t.action === target.action &&
      t.chainId === target.chainId &&
      t.referendumId === target.referendumId
        ? target
        : t
    );

    storePointer.set(key, JSON.stringify(updated));
  }
}
