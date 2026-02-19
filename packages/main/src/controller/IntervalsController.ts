// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { IntervalSubscriptionsRepository } from '../db';
import { ChainEventsController } from './ChainEventsController';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

/**
 * @name IntervalsController
 * @summary Manages interval subscription persistence.
 */
export class IntervalsController {
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
   * @summary Add interval subscription to database.
   */
  private static add(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const parsed = JSON.parse(serialized);
    IntervalSubscriptionsRepository.set(parsed);
  }

  /**
   * @name addMulti
   * @summary Add multiple interval subscriptions to database.
   */
  private static addMulti(tasks: IntervalSubscription[]) {
    tasks.forEach((t) => {
      IntervalSubscriptionsRepository.set(t);
    });
  }

  /**
   * @name clear
   * @summary Clear interval subscriptions from database.
   */
  private static clear(): string {
    IntervalSubscriptionsRepository.clear();
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
   * @summary Persist new tasks to database and return them to renderer to process.
   * Receives serialized tasks from an exported backup file.
   */
  private static doImport(ipcTask: IpcTask): string {
    const { serialized }: { serialized: string } = ipcTask.data;
    const received: IntervalSubscription[] = JSON.parse(serialized);
    const stored: IntervalSubscription[] = JSON.parse(
      IntervalsController.get(),
    );

    // Persist imported tasks to database.
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
   * @summary Check if a given interval subscription task exists in the database.
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
   * @summary Get serialized interval subscriptions from database.
   */
  private static get(): string {
    return IntervalSubscriptionsRepository.getAll();
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
   * @summary Remove interval subscription from database.
   */
  private static remove(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const target: IntervalSubscription = JSON.parse(serialized);
    IntervalSubscriptionsRepository.delete(
      target.action,
      target.chainId,
      target.referendumId,
    );
  }

  private static removeTasks(task: IpcTask) {
    const { chainId, refId } = task.data;
    IntervalSubscriptionsRepository.deleteByChainAndRefId(
      chainId as ChainID,
      refId,
    );
    ChainEventsController.removeActiveRefId(chainId, refId);
  }

  /**
   * @name update
   * @summary Update an interval subscription in the database.
   */
  private static update(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const target: IntervalSubscription = JSON.parse(serialized);
    IntervalSubscriptionsRepository.update(target);
  }

  /**
   * @name updateTask
   * @summary Update data for an existing task persisted in the database.
   */
  private static updateTask(task: IntervalSubscription) {
    IntervalSubscriptionsRepository.update(task);
  }
}
