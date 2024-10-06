// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import type { AnyData } from '@/types/misc';
import type { IntervalSubscription } from '@/types/subscriptions';
import type { IpcTask } from '@/types/communication';

export class IntervalsController {
  private static key = 'interval_subscriptions';

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
      case 'interval:tasks:import': {
        return this.doImport(task);
      }
    }
  }

  /**
   * @name add
   * @summary Add interval subscription to store.
   */
  private static add(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const stored: IntervalSubscription[] = JSON.parse(this.get());
    stored.push(JSON.parse(serialized));
    this.set(stored);
  }

  /**
   * @name addMulti
   * @summary Add multiple interval subscription to store.
   */
  private static addMulti(tasks: IntervalSubscription[]) {
    const stored: IntervalSubscription[] = JSON.parse(this.get());
    tasks.forEach((t) => stored.push(t));
    this.set(stored);
  }

  /**
   * @name clear
   * @summary Clear interval subscriptions from store.
   */
  private static clear(): string {
    const storePointer: Record<string, AnyData> = store;
    storePointer.delete(this.key);
    return 'done';
  }

  /**
   * @name compare
   * @summary Compare data of two tasks to determine if they're the same task.
   */
  private static compare(
    left: IntervalSubscription,
    right: IntervalSubscription
  ): boolean {
    return left.action === right.action &&
      left.chainId === right.chainId &&
      left.referendumId === right.referendumId
      ? true
      : false;
  }

  /**
   * @name doImport
   * @summary Persist new tasks to store and return them to renderer to process.
   * Receives serialized tasks from an exported backup file.
   */
  private static doImport(ipcTask: IpcTask): string {
    const { serialized }: { serialized: string } = ipcTask.data;
    const received: IntervalSubscription[] = JSON.parse(serialized);
    const stored: IntervalSubscription[] = JSON.parse(this.get());

    // Persist imported tasks to store.
    const inserts = received.filter((t) => !this.exists(t, stored));
    const updates = received.filter((t) => this.exists(t, stored));

    inserts.length !== 0 && this.addMulti(inserts);
    updates.forEach((t) => this.updateTask(t));

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
    stored: IntervalSubscription[]
  ): boolean {
    for (const item of stored) {
      if (this.compare(task, item)) {
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
    const stored: string = storePointer.get(this.key) || '[]';
    return stored;
  }

  /**
   * @name getBackupData
   * @summary Get stored serialized tasks for writing to a backup text file.
   */
  static getBackupData(): string {
    return this.get();
  }

  /**
   * @name remove
   * @summary Remove interval subscription from store.
   */
  private static remove(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const target: IntervalSubscription = JSON.parse(serialized);
    const stored: IntervalSubscription[] = JSON.parse(this.get());
    const filtered = stored.filter(
      (t) =>
        !(
          t.action === target.action &&
          t.chainId === target.chainId &&
          t.referendumId === target.referendumId
        )
    );
    this.set(filtered);
  }

  /**
   * @name set
   * @summary Updates stored interval subscriptions.
   */
  private static set(tasks: IntervalSubscription[]) {
    const storePointer: Record<string, AnyData> = store;
    storePointer.set(this.key, JSON.stringify(tasks));
  }

  /**
   * @name update
   * @summary Update an interval subscription in the store.
   */
  private static update(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const target: IntervalSubscription = JSON.parse(serialized);
    const stored: IntervalSubscription[] = JSON.parse(this.get());
    const updated = stored.map((t) => (this.compare(target, t) ? target : t));
    this.set(updated);
  }

  /**
   * @name updateTask
   * @summary Update data for an existing task persisted in the store.
   */
  private static updateTask(task: IntervalSubscription) {
    const stored: IntervalSubscription[] = JSON.parse(this.get());
    const updated = stored.map((t) => (this.compare(task, t) ? task : t));
    this.set(updated);
  }
}
