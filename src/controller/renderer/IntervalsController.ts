// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { secondsUntilNextMinute } from '@/renderer/utils/timeUtils';
import type { ChainID } from '@/types/chains';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { AnyData } from '@/types/misc';

export interface IntervalSubscription {
  // Unique id for the task.
  action: string;
  // Number of periods between each interval.
  waitPeriods: number;
  // Used as a countdown.
  periodCounter: number;
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

export class IntervalsController {
  /// Active interval subscriptions keyed by chain ID.
  static subscriptions = new Map<ChainID, IntervalSubscription[]>();

  /// Interval ID.
  static intervalId: AnyData = null;
  /// Timeout ID.
  static timeoutId: AnyData = null;
  /// Minimum clock period in minutes.
  static periodDuration = 5;
  /// Maximum wait periods for an interval subscription.
  static maxPeriods = 5;

  /**
   * @name initIntervals
   * @summary Initialize intervals and the interval clock.
   */
  static initIntervals() {
    // TODO: Fetch persisted intervals and re-start the subscription.

    // Start interval.
    this.initClock();
  }

  /**
   * @name insertInterval
   * @summary Insert an intervaled subscription into this controller's map.
   */
  static insertSubscription(subscription: IntervalSubscription) {
    const { chainId } = subscription;
    if (this.subscriptions.has(chainId)) {
      const current = this.subscriptions.get(chainId)!;
      this.subscriptions.set(chainId, [...current, { ...subscription }]);
    } else {
      this.subscriptions.set(chainId, [{ ...subscription }]);
    }
  }

  /**
   * @name removeSubscription
   * @summary Remove an intervaled subscription from the controller's map.
   */
  static removeSubscription(subscription: IntervalSubscription) {
    const { chainId, action, referendumId } = subscription;

    const updated = this.subscriptions
      .get(chainId)!
      .filter((t) => !(t.action === action && t.referendumId === referendumId));

    updated.length !== 0
      ? this.subscriptions.set(chainId, updated)
      : this.subscriptions.delete(chainId);
  }

  /**
   * @name initClock
   * @summary Start interval when period duration is synched to the system clock.
   *
   * For example, if the period duration is 15 minutes, the interval will start
   * at the nearest 15 minute multiple of the actual clock.
   */
  static initClock() {
    console.log(`Initialized:`);
    console.log(this.subscriptions);

    // Seconds until next period synched with clock.
    const seconds = secondsUntilNextMinute(1);
    console.log(`seconds to wait: ${seconds / 10}`);

    if (seconds === 0) {
      // Start the interval now clock is synched.
      this.startInterval();
    } else {
      // Wait until clock is synched before starting interval.
      const ms = seconds * 100;
      this.timeoutId = setTimeout(() => {
        if (this.timeoutId !== null) {
          this.timeoutId = null;
          this.startInterval();
        }
      }, ms);
    }
  }

  /**
   * @name startInterval
   * @summary Start the interval for processing interval subscriptions.
   */
  private static startInterval() {
    this.intervalId = setInterval(async () => {
      await this.processTick();
    }, this.periodDuration * 1000);
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
    // Get all intervals from map and execute the ones whose period has synched.
    for (const [chainId, chainSubscriptions] of this.subscriptions.entries()) {
      console.log(`Processing interval subscriptions for chain: ${chainId}`);

      for (const taskObj of chainSubscriptions) {
        const { periodCounter, waitPeriods } = taskObj;
        const curPeriod = periodCounter + 1;

        if (curPeriod === waitPeriods) {
          // TODO: Implement queuing system.
          await this.executeAction(taskObj);
        }
      }

      // Increment period counter by one for all tasks or reset to zero.
      this.subscriptions.set(
        chainId,
        chainSubscriptions.map((t) => ({
          ...t,
          periodCounter:
            t.periodCounter + 1 === t.waitPeriods ? 0 : t.periodCounter + 1,
        }))
      );
    }
  }

  /**
   * @name executeAction
   * @summary Extract an interval subscription's action and execute a one-shot.
   */
  private static async executeAction(task: IntervalSubscription) {
    const { action } = task;
    console.log(`Execute: ${action}`);

    switch (action) {
      case 'subscribe:interval:openGov:referendaVotes': {
        // TODO: Call one-shot.
        break;
      }
      case 'subscribe:interval:openGov:decisionPeriod': {
        // TODO: Call one-shot.
        break;
      }
      case 'subscribe:interval:openGov:referendumThresholds': {
        // TODO: Call one-shot.
        break;
      }
      default: {
        throw new Error(`Interval task action ${action} not recognized`);
      }
    }
  }
}
