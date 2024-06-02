// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { executeIntervaledOneShot } from '@/renderer/callbacks/intervaled';
import { secondsUntilNextMinute } from '@/renderer/utils/timeUtils';
import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';

/// Where `default` reads the tasks `enableOsNotifications` field.
export type NotificationPolicy = 'default' | 'none' | 'one-shot';

export interface IntervalSubscription {
  // Unique id for the task.
  action: string;
  // Number of ticks between each one-shot execution.
  intervalSetting: IntervalSetting;
  // Used as a countdown.
  tickCounter: number;
  // Task category.
  category: string;
  // Task's associated chain.
  chainId: ChainID;
  // Shown in renderer.
  label: string;
  // Enabled or disabled.
  status: 'enable' | 'disable';
  // Flag to enable or silence OS notifications.
  enableOsNotifications: boolean;
  // Key to retrieve help information about the task.
  helpKey: HelpItemKey;
  // Associated referendum id for task.
  referendumId?: number;
  // Flag to determine if the subscription was just build (may not be needed)
  justBuilt?: boolean;
}

export interface IntervalSetting {
  label: string;
  ticksToWait: number;
}

export class IntervalsController {
  /// Active interval subscriptions keyed by chain ID.
  static subscriptions = new Map<ChainID, IntervalSubscription[]>();

  /// Interval ID.
  static intervalId: AnyData = null;
  /// Timeout ID.
  static timeoutId: AnyData = null;
  /// Minimum clock period in seconds.
  static tickDuration = 5;
  /// Possible durations for an interval subscription.
  static durations: IntervalSetting[] = [
    { label: '15 minutes', ticksToWait: 1 },
    { label: '30 minutes', ticksToWait: 2 },
    { label: '1 hour', ticksToWait: 4 },
    { label: '2 hours', ticksToWait: 8 },
    { label: '4 hours', ticksToWait: 16 },
    { label: '6 hours', ticksToWait: 24 },
    { label: '12 hours', ticksToWait: 48 },
    { label: '24 hours', ticksToWait: 96 },
  ];

  /**
   * @name initIntervals
   * @summary Initialize the interval clock.
   *
   * NOTE: This method is called when app initializes and switches to online mode.
   */
  static async initIntervals(isOnline: boolean) {
    isOnline && this.initClock();
  }

  /**
   * @name insertInterval
   * @summary Insert an intervaled subscription into this controller's map.
   */
  static insertSubscription(subscription: IntervalSubscription) {
    console.log('INSERT SUBSCRIPTION:');
    console.log(subscription);

    // Stop interval.
    this.stopInterval();

    const { chainId } = subscription;
    if (this.subscriptions.has(chainId)) {
      const current = this.subscriptions.get(chainId)!;
      this.subscriptions.set(chainId, [...current, { ...subscription }]);
    } else {
      this.subscriptions.set(chainId, [{ ...subscription }]);
    }

    // Restart interval after updating cached tasks.
    this.initClock();
  }

  /**
   * @name removeSubscription
   * @summary Remove an intervaled subscription from the controller's map.
   */
  static removeSubscription(subscription: IntervalSubscription) {
    console.log('REMOVE SUBSCRIPTION:');
    console.log(subscription);

    // Stop interval.
    this.stopInterval();

    const { chainId, action, referendumId } = subscription;

    // This task may not be enabled and thus not managed by this controller.
    // Check if the subscriptions map as a chain ID key to avoid errors.
    // Exit early if the key does not exist in the map.
    if (!this.subscriptions.has(chainId)) {
      return;
    }

    const updated = this.subscriptions
      .get(chainId)!
      .filter((t) => !(t.action === action && t.referendumId === referendumId));

    updated.length !== 0
      ? this.subscriptions.set(chainId, updated)
      : this.subscriptions.delete(chainId);

    // Start interval if tasks are still being managed.
    if (this.subscriptions.size > 0) {
      this.initClock();
    }
  }

  /**
   * @name updateSubscription
   * @summary Updae data of a managed interval subscription task.
   */
  static updateSubscription(task: IntervalSubscription) {
    console.log('UPDATE SUBSCRIPTION:');
    console.log(task);

    // Stop interval.
    this.stopInterval();

    const { chainId, action, referendumId } = task;

    const updated = this.subscriptions
      .get(chainId)!
      .map((t) =>
        t.action === action && t.referendumId === referendumId ? task : t
      );

    this.subscriptions.set(chainId, updated);

    // Restart interval.
    this.initClock();
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
    console.log(this.subscriptions);

    // Exit early if no subscriptions are being managed.
    if (this.subscriptions.size === 0) {
      return;
    }

    // Seconds until next period synched with clock.
    const seconds = secondsUntilNextMinute(this.tickDuration);
    console.log(`seconds to wait: ${seconds}`);

    if (seconds === 0) {
      // Start the interval now clock is synched.
      this.startInterval();
    } else {
      // Wait until clock is synched before starting interval.
      this.timeoutId = setTimeout(() => {
        if (this.timeoutId !== null) {
          this.timeoutId = null;
          this.startInterval();
        }
      }, seconds * 1000);
    }
  }

  /**
   * @name startInterval
   * @summary Start the interval for processing managed subscriptions.
   */
  private static startInterval() {
    this.intervalId = setInterval(
      async () => {
        await this.processTick();
      },
      this.tickDuration * 60 * 1000 // 5 minutes
    );
  }

  /**
   * @name stopInterval
   * @summary Stops the interval.
   */
  static stopInterval() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * @name processTick
   * @summary Process an interval tick.
   */
  static async processTick() {
    const taskQueue: IntervalSubscription[] = [];

    // Iterate all subscriptions and execute the ones whose tick has synched.
    for (const [chainId, chainSubscriptions] of this.subscriptions.entries()) {
      console.log(`Processing interval subscriptions for chain: ${chainId}`);

      for (const task of chainSubscriptions) {
        const { tickCounter, intervalSetting } = task;
        if (tickCounter + 1 === intervalSetting.ticksToWait) {
          // Push to task queue.
          taskQueue.push({ ...task });
        }
      }

      // Increment tick counter by one or reset to zero for all tasks.
      this.subscriptions.set(
        chainId,
        chainSubscriptions.map(
          (t): IntervalSubscription => ({
            ...t,
            tickCounter:
              t.tickCounter + 1 >= t.intervalSetting.ticksToWait
                ? 0
                : t.tickCounter + 1,
          })
        )
      );
    }

    // Execute callbacks for queued tasks.
    await this.processTaskQueue(taskQueue);
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

    if (taskQueue.length === 1) {
      // Execute callback as normal.
      for (const task of taskQueue) {
        await executeIntervaledOneShot(task);
      }
    } else {
      // Instruct callbacks to not show a notification.
      for (const task of taskQueue) {
        await executeIntervaledOneShot(task, 'none');
      }

      // Render a single OS notification.
      window.myAPI.showNotification({
        title: 'Polkadot Live',
        body: `Processed ${taskQueue.length} new events.`,
      });
    }
  }
}
