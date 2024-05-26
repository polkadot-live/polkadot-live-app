// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { secondsUntilNextMinute } from '@/renderer/utils/timeUtils';
import type { ChainID } from '@/types/chains';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { AnyData } from '@/types/misc';

interface IntervalSubscription {
  // Unique id for the task.
  action: string;
  // Number of periods between each interval.
  waitPeriods: number;
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
  // Flag to determine if the subscription was just build (may not be needed)
  justBuilt?: boolean;
  // Key to retrieve help information about the task.
  helpKey: HelpItemKey;
}

export class IntervalsController {
  static subscriptions = new Map<ChainID, IntervalSubscription[]>();

  /// Interval ID.
  static intervalId: AnyData = null;
  /// Minimum clock period in minutes.
  static periodDuration = 1;

  /**
   * @name initIntervals
   * @summary Initialize intervals and the interval clock.
   */
  static initIntervals() {
    // Set map data.
    this.subscriptions = new Map();
    this.insertSubscription({
      action: 'interval:openGov:referendumVotes',
      category: 'Open Gov',
      chainId: 'Polkadot',
      label: 'Referendum Votes',
      status: 'enable',
      enableOsNotifications: true,
      helpKey: 'help:interval:openGov:referendumVotes',
      waitPeriods: 1,
    });

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
   * @name initClock
   * @summary Start interval when period duration is synched to the system clock.
   *
   * For example, if the period duration is 15 minutes, the interval will start
   * at the nearest 15 minute multiple of the actual clock.
   */
  private static initClock() {
    // Seconds until next period synched with clock.
    const seconds = secondsUntilNextMinute(1);
    console.log(`seconds to wait: ${seconds}`);

    if (seconds === 0) {
      // Start the interval now clock is synched.
      this.startInterval();
    } else {
      // Wait until clock is synched before starting interval.
      const ms = seconds * 1000;
      setTimeout(() => {
        this.startInterval();
      }, ms);
    }
  }

  /**
   * @name startInterval
   * @summary Start the interval for processing interval subscriptions.
   */
  private static startInterval() {
    this.intervalId = setInterval(() => {
      console.log(`interval tick`);
    }, this.periodDuration * 1000);
  }

  /**
   * @name stopInterval
   * @summary Stops the interval.
   */
  static stopInterval() {
    clearInterval(this.intervalId);
  }
}
