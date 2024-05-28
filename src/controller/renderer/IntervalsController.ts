// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { secondsUntilNextMinute } from '@/renderer/utils/timeUtils';
import type { ChainID } from '@/types/chains';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { AnyData } from '@/types/misc';

export interface IntervalSubscription {
  // Unique id for the task.
  action: string;
  // Number of ticks between each one-shot execution.
  ticksToWait: number;
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

export class IntervalsController {
  /// Active interval subscriptions keyed by chain ID.
  static subscriptions = new Map<ChainID, IntervalSubscription[]>();

  /// Interval ID.
  static intervalId: AnyData = null;
  /// Timeout ID.
  static timeoutId: AnyData = null;
  /// Minimum clock period in seconds.
  static tickDuration = 5;
  /// Maximum wait periods for an interval subscription.
  static maxPeriods = 5;

  /**
   * @name initIntervals
   * @summary Initialize intervals and the interval clock.
   */
  static initIntervals() {
    // TODO: Fetch persisted intervals and re-start the subscription.
    // NOTE: This method is called when app switches to online mode.

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
   * @summary Start interval when its tick duration is synched to the system clock.
   *
   * For example, if the tick duration is 15 minutes, the interval will start
   * at the nearest 15 minute multiple of the actual clock.
   */
  static initClock() {
    console.log(`Initialized:`);
    console.log(this.subscriptions);

    // Exit early if no subscriptions are being managed.
    if (this.subscriptions.size === 0) {
      return;
    }

    // Seconds until next period synched with clock.
    const seconds = secondsUntilNextMinute(1);
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
    this.intervalId = setInterval(async () => {
      await this.processTick();
    }, this.tickDuration * 1000);
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
    // Iterate all subscriptions and execute the ones whose tick has synched.
    for (const [chainId, chainSubscriptions] of this.subscriptions.entries()) {
      console.log(`Processing interval subscriptions for chain: ${chainId}`);

      for (const task of chainSubscriptions) {
        if (task.tickCounter + 1 === task.ticksToWait) {
          // TODO: Implement queuing system.
          await this.executeAction(task);
        }
      }

      // Increment tick counter by one or reset to zero for all tasks.
      this.subscriptions.set(
        chainId,
        chainSubscriptions.map(
          (t): IntervalSubscription => ({
            ...t,
            tickCounter:
              t.tickCounter + 1 === t.ticksToWait ? 0 : t.tickCounter + 1,
          })
        )
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
      case 'subscribe:interval:openGov:referendumVotes': {
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
