// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { intervalDurationsConfig } from '@polkadot-live/consts/subscriptions/interval';
import { executeIntervaledOneShot } from '../callbacks/intervaled';
import { secondsUntilNextMinute } from '../library/TimeLib';
import { APIsController } from './APIsController';
import { BusDispatcher } from './BusDispatcher';
import type { ChainID } from '@polkadot-live/types/chains';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  IntervalSetting,
  IntervalSubscription,
} from '@polkadot-live/types/subscriptions';

export class IntervalsController {
  /// Active interval subscriptions keyed by chain ID.
  static subscriptions = new Map<ChainID, IntervalSubscription[]>();

  /// Interval ID.
  static intervalId: AnyData = null;
  /// Timeout ID.
  static timeoutId: AnyData = null;
  /// Minimum clock period in minutes.
  static tickDuration = 15;
  /// Possible durations for an interval subscription.
  static durations: IntervalSetting[] = [...intervalDurationsConfig];

  /**
   * @name hasActiveSubscriptions
   * @summary Returns `true` if there are any active subscriptions, `false` otherwise.
   */
  static hasActiveSubscriptions = (): boolean => {
    if (this.subscriptions.size === 0) {
      return false;
    }
    for (const items of this.subscriptions.values()) {
      for (const { status } of items) {
        if (status === 'enable') {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * @name initIntervals
   * @summary Initialize the interval clock.
   *
   * NOTE: This method is called when app initializes and switches to online mode.
   */
  static initIntervals(isOnline: boolean) {
    isOnline && IntervalsController.initClock();
  }

  /**
   * @name insertSubscriptions
   * @summary Allows inserting multiple interval subscriptions into this controller's map.
   */
  static insertSubscriptions(
    subscriptions: IntervalSubscription[],
    isOnline: boolean,
  ) {
    // Stop interval if it is running.
    IntervalsController.stopInterval();

    // Insert tasks into map.
    for (const task of subscriptions) {
      if (task.status === 'disable') {
        continue;
      }
      const { chainId } = task;
      if (IntervalsController.subscriptions.has(chainId)) {
        const current = IntervalsController.subscriptions.get(chainId)!;
        IntervalsController.subscriptions.set(chainId, [
          ...current,
          { ...task },
        ]);
      } else {
        IntervalsController.subscriptions.set(chainId, [{ ...task }]);
      }
    }
    // Restart interval.
    isOnline && IntervalsController.initClock();
  }

  /**
   * @name insertSubscription
   * @summary Insert an interval subscription into this controller's map.
   */
  static insertSubscription(
    subscription: IntervalSubscription,
    isOnline: boolean,
  ) {
    console.log('Insert interval subscription:');
    console.log(subscription);
    // Stop interval.
    IntervalsController.stopInterval();

    const { chainId } = subscription;
    if (IntervalsController.subscriptions.has(chainId)) {
      const current = IntervalsController.subscriptions.get(chainId)!;
      IntervalsController.subscriptions.set(chainId, [
        ...current,
        { ...subscription },
      ]);
    } else {
      IntervalsController.subscriptions.set(chainId, [{ ...subscription }]);
    }
    // Restart interval after updating cached tasks.
    isOnline && IntervalsController.initClock();
  }

  /**
   * @name removeSubscriptions
   * @summary Allows removing multiple interval subscriptions from this controller's map.
   */
  static removeSubscriptions(
    subscriptions: IntervalSubscription[],
    isOnline: boolean,
  ) {
    // Stop interval.
    IntervalsController.stopInterval();

    // Remove subscriptions from map.
    for (const task of subscriptions) {
      if (!IntervalsController.subscriptions.has(task.chainId)) {
        continue;
      }
      const { chainId, action, referendumId } = task;
      const updated = IntervalsController.subscriptions
        .get(chainId)!
        .filter(
          (t) => !(t.action === action && t.referendumId === referendumId),
        );
      updated.length !== 0
        ? IntervalsController.subscriptions.set(chainId, updated)
        : IntervalsController.subscriptions.delete(chainId);
    }
    if (isOnline && IntervalsController.hasActiveSubscriptions()) {
      IntervalsController.initClock();
    }
  }

  /**
   * @name removeSubscription
   * @summary Remove an intervaled subscription from the controller's map.
   */
  static removeSubscription(
    subscription: IntervalSubscription,
    isOnline: boolean,
  ) {
    // Stop interval.
    IntervalsController.stopInterval();
    const { chainId, action, referendumId } = subscription;

    // This task may not be enabled and thus not managed by this controller.
    // Check if the subscriptions map as a chain ID key to avoid errors.
    // Exit early if the key does not exist in the map.
    if (!IntervalsController.subscriptions.has(chainId)) {
      return;
    }
    const updated = IntervalsController.subscriptions
      .get(chainId)!
      .filter((t) => !(t.action === action && t.referendumId === referendumId));

    updated.length !== 0
      ? IntervalsController.subscriptions.set(chainId, updated)
      : IntervalsController.subscriptions.delete(chainId);

    // Start interval if tasks are still being managed.
    if (isOnline && IntervalsController.hasActiveSubscriptions()) {
      IntervalsController.initClock();
    }
  }

  /**
   * @name updateSubscription
   * @summary Update data of a managed interval subscription task.
   */
  static updateSubscription(task: IntervalSubscription) {
    if (task.status === 'disable') {
      return;
    }
    // Stop interval.
    IntervalsController.stopInterval();
    const { chainId, action, referendumId } = task;
    const updated = IntervalsController.subscriptions
      .get(chainId)!
      .map((t) =>
        t.action === action && t.referendumId === referendumId ? task : t,
      );
    IntervalsController.subscriptions.set(chainId, updated);

    // Restart interval.
    IntervalsController.initClock();
  }

  /**
   * @name initClock
   * @summary Start interval when its tick duration is synched to the system clock.
   *
   * For example, if the tick duration is 15 minutes, the interval will start
   * at the nearest 15 minute multiple of the actual clock.
   */
  static initClock() {
    console.log(`Init Clock:`);
    console.log(IntervalsController.subscriptions);

    // Exit early if no subscriptions are being managed.
    if (!IntervalsController.hasActiveSubscriptions()) {
      return;
    }
    // Seconds until next period synched with clock.
    const seconds = secondsUntilNextMinute(IntervalsController.tickDuration);
    console.log(`Seconds to wait: ${seconds}`);

    if (seconds === 0) {
      // Start the interval now clock is synched.
      IntervalsController.startInterval();
    } else {
      // Wait until clock is synched before starting interval.
      IntervalsController.timeoutId = setTimeout(async () => {
        if (IntervalsController.timeoutId !== null) {
          IntervalsController.timeoutId = null;

          // Process the first tick and then start the interval..
          await IntervalsController.processTick();
          IntervalsController.startInterval();
        }
      }, seconds * 1000);
    }
  }

  /**
   * @name startInterval
   * @summary Start the interval for processing managed subscriptions.
   */
  private static startInterval() {
    IntervalsController.intervalId = setInterval(
      async () => {
        await IntervalsController.processTick();
      },
      IntervalsController.tickDuration * 60 * 1000, // tick duration in minutes.
    );
  }

  /**
   * @name stopInterval
   * @summary Stops the interval.
   */
  static stopInterval() {
    if (IntervalsController.timeoutId !== null) {
      clearTimeout(IntervalsController.timeoutId);
      IntervalsController.timeoutId = null;
    }
    if (IntervalsController.intervalId !== null) {
      clearInterval(IntervalsController.intervalId);
      IntervalsController.intervalId = null;
    }
  }

  /**
   * @name processTick
   * @summary Process an interval tick.
   */
  static async processTick() {
    const taskQueue: IntervalSubscription[] = [];

    // Iterate all subscriptions and execute the ones whose tick has synched.
    for (const [
      chainId,
      chainSubscriptions,
    ] of IntervalsController.subscriptions.entries()) {
      console.log(`Processing interval subscriptions for chain: ${chainId}`);

      for (const task of chainSubscriptions) {
        const { tickCounter, intervalSetting } = task;
        if (tickCounter + 1 === intervalSetting.ticksToWait) {
          // Push to task queue.
          taskQueue.push({ ...task });
        }
      }

      // Increment tick counter by one or reset to zero for all tasks.
      IntervalsController.subscriptions.set(
        chainId,
        chainSubscriptions.map(
          (t): IntervalSubscription => ({
            ...t,
            tickCounter:
              t.tickCounter + 1 >= t.intervalSetting.ticksToWait
                ? 0
                : t.tickCounter + 1,
          }),
        ),
      );
    }

    // Execute callbacks for queued tasks.
    await IntervalsController.processTaskQueue(taskQueue);
  }

  /**
   * @name processTaskQueue
   * @summary Execute callbacks for queued tasks.
   *
   * If more than one native OS notification needs to be shown, process the
   * queued tasks as a "batch" where only one OS notification is shown, and
   * event items are rendered normally.
   */
  static async processTaskQueue(taskQueue: IntervalSubscription[]) {
    if (taskQueue.length === 0) {
      return;
    }

    // Separate tasks depending on their OS notification flag.
    const onTasks = taskQueue.filter((t) => t.enableOsNotifications === true);
    const offTasks = taskQueue.filter((t) => t.enableOsNotifications === false);

    // If there's only one task with OS notifications checked.
    if (onTasks.length === 1) {
      // Execute callback as normal.
      for (const task of onTasks) {
        await executeIntervaledOneShot(task, 'one-shot');
      }
    } else if (onTasks.length > 1) {
      // Instruct callbacks to not show a notification.
      for (const task of onTasks) {
        await executeIntervaledOneShot(task, 'none');
      }

      // Render a single OS notification.
      const title = 'Polkadot Live';
      const body = `Processed ${onTasks.length} new events.`;
      switch (APIsController.backend) {
        case 'browser': {
          BusDispatcher.dispatch('showNotification', { title, body });
          break;
        }
        case 'electron': {
          window.myAPI.showNotification({ title, body });
          break;
        }
      }
    }

    // Handle remaining tasks not requiring an OS notification.
    if (offTasks.length) {
      // Instruct callbacks to not show a notification.
      for (const task of offTasks) {
        await executeIntervaledOneShot(task, 'none');
      }
    }
  }
}
