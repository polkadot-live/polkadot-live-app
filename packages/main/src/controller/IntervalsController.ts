// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '../main';
import { ChainEventsController } from './ChainEventsController';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { AnyData } from '@polkadot-live/types/misc';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export class IntervalsController {
  private static key = 'interval_subscriptions';

  /**
   * @name process
   * @summary Process an interval subscription IPC task.
   */
  static process(task: IpcTask): string | undefined {
    switch (task.action) {
      case 'interval:task:add': {
        IntervalsController.add(task);
        return;
      }
      case 'interval:task:clear': {
        return IntervalsController.clear();
      }
      case 'interval:task:get': {
        return IntervalsController.get();
      }
      case 'interval:task:remove': {
        IntervalsController.remove(task);
        return;
      }
      case 'interval:tasks:remove': {
        IntervalsController.removeTasks(task);
        return;
      }
      case 'interval:task:update': {
        IntervalsController.update(task);
        return;
      }
      case 'interval:tasks:import': {
        return IntervalsController.doImport(task);
      }
    }
  }

  /**
   * @name add
   * @summary Add interval subscription to store.
   */
  private static add(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const stored: IntervalSubscription[] = JSON.parse(
      IntervalsController.get(),
    );
    stored.push(JSON.parse(serialized));
    IntervalsController.set(stored);
  }

  /**
   * @name addMulti
   * @summary Add multiple interval subscription to store.
   */
  private static addMulti(tasks: IntervalSubscription[]) {
    const stored: IntervalSubscription[] = JSON.parse(
      IntervalsController.get(),
    );
    tasks.forEach((t) => {
      stored.push(t);
    });
    IntervalsController.set(stored);
  }

  /**
   * @name clear
   * @summary Clear interval subscriptions from store.
   */
  private static clear(): string {
    const storePointer: Record<string, AnyData> = store;
    storePointer.delete(IntervalsController.key);
    return 'done';
  }

  /**
   * @name compare
   * @summary Compare data of two tasks to determine if they're the same task.
   */
  private static compare(
    left: IntervalSubscription,
    right: IntervalSubscription,
  ): boolean {
    return !!(
      left.action === right.action &&
      left.chainId === right.chainId &&
      left.referendumId === right.referendumId
    );
  }

  /**
   * @name doImport
   * @summary Persist new tasks to store and return them to renderer to process.
   * Receives serialized tasks from an exported backup file.
   */
  private static doImport(ipcTask: IpcTask): string {
    const { serialized }: { serialized: string } = ipcTask.data;
    const received: IntervalSubscription[] = JSON.parse(serialized);
    const stored: IntervalSubscription[] = JSON.parse(
      IntervalsController.get(),
    );

    // Persist imported tasks to store.
    const inserts = received.filter(
      (t) => !IntervalsController.exists(t, stored),
    );
    const updates = received.filter((t) =>
      IntervalsController.exists(t, stored),
    );

    inserts.length !== 0 && IntervalsController.addMulti(inserts);
    updates.forEach((t) => {
      IntervalsController.updateTask(t);
    });

    // Serialize new and updated tasks in a map structure.
    const map = new Map<string, string>();
    map.set('insert', JSON.stringify(inserts));
    map.set('update', JSON.stringify(updates));

    // Return tasks in serialized form.
    return JSON.stringify(Array.from(map.entries()));
  }

  /**
   * @name exists
   * @summary Check if a given interval subscription task exists in the store.
   */
  private static exists(
    task: IntervalSubscription,
    stored: IntervalSubscription[],
  ): boolean {
    for (const item of stored) {
      if (IntervalsController.compare(task, item)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @name get
   * @summary Get serialized interval subscriptions from store.
   */
  private static get(): string {
    const storePointer: Record<string, AnyData> = store;
    const stored: string = storePointer.get(IntervalsController.key) || '[]';
    return stored;
  }

  /**
   * @name getBackupData
   * @summary Get stored serialized tasks for writing to a backup text file.
   */
  static getBackupData(): string {
    return IntervalsController.get();
  }

  /**
   * @name remove
   * @summary Remove interval subscription from store.
   */
  private static remove(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const target: IntervalSubscription = JSON.parse(serialized);
    const stored: IntervalSubscription[] = JSON.parse(
      IntervalsController.get(),
    );
    const filtered = stored.filter(
      (t) =>
        !(
          t.action === target.action &&
          t.chainId === target.chainId &&
          t.referendumId === target.referendumId
        ),
    );
    IntervalsController.set(filtered);
  }

  private static removeTasks(task: IpcTask) {
    const { chainId, refId } = task.data;
    const stored: IntervalSubscription[] = JSON.parse(
      IntervalsController.get(),
    );
    const updated = stored.filter(
      (t) => !(t.chainId === chainId && t.referendumId === refId),
    );
    IntervalsController.set(updated);
    ChainEventsController.removeActiveRefId(chainId, refId);
  }

  /**
   * @name set
   * @summary Updates stored interval subscriptions.
   */
  private static set(tasks: IntervalSubscription[]) {
    const storePointer: Record<string, AnyData> = store;
    storePointer.set(IntervalsController.key, JSON.stringify(tasks));
  }

  /**
   * @name update
   * @summary Update an interval subscription in the store.
   */
  private static update(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const target: IntervalSubscription = JSON.parse(serialized);
    const stored: IntervalSubscription[] = JSON.parse(
      IntervalsController.get(),
    );
    const updated = stored.map((t) =>
      IntervalsController.compare(target, t) ? target : t,
    );
    IntervalsController.set(updated);
  }

  /**
   * @name updateTask
   * @summary Update data for an existing task persisted in the store.
   */
  private static updateTask(task: IntervalSubscription) {
    const stored: IntervalSubscription[] = JSON.parse(
      IntervalsController.get(),
    );
    const updated = stored.map((t) =>
      IntervalsController.compare(task, t) ? task : t,
    );
    IntervalsController.set(updated);
  }
}
