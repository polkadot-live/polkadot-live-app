// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AppOrchestrator } from '@/orchestrators/AppOrchestrator';
import dns from 'dns';

export class OnlineStatusController {
  private static onlineStatus = false;
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * @name getStatus
   * @summary Returns the cached online status.
   */
  static getStatus(): boolean {
    return this.onlineStatus;
  }

  /**
   * @name initialize
   * @summary Set connection status and start connection polling loop.
   */
  static async initialize() {
    this.onlineStatus = await this.isConnected();
    this.startPollLoop();
  }

  /**
   * @name handleStatusChange
   * @summary Checks for a change in connection status and calls the appropriate
   * app task depending on whether the app has gone offline or online.
   */
  static handleStatusChange = async () => {
    const status = await this.isConnected();

    if (status !== this.onlineStatus) {
      this.onlineStatus = status;
      console.log(`Online status changed to ${status}`);

      await AppOrchestrator.next({
        task: `app:initialize:${status ? 'online' : 'offline'}`,
      });

      // Re-initialize class if app goes offline to prevent stalling
      // upon calling `isConnected`.
      if (!status && this.intervalId) {
        this.stopPollLoop();
        await this.initialize();
      }
    }
  };

  /**
   * @name startPoll
   * @summary Calls a connection handling function after a set interval for
   * handling offline and online status changes.
   */
  private static startPollLoop = () => {
    const interval = 5000;
    this.intervalId = setInterval(this.handleStatusChange, interval);
  };

  /**
   * @name stopPoll
   * @summary Stop the connection polling interval.
   */
  private static stopPollLoop = async () =>
    this.intervalId && clearInterval(this.intervalId);

  /**
   * @name isConnected
   * @summary One-liner function to check if internet is available.
   */
  private static isConnected = async () =>
    !!(await dns.promises.resolve('google.com').catch(() => false));

  /**
   * @name handleSuspend
   * @summary Called when the system is suspended. Stops the poll loop and
   * sets the app to offline mode.
   */
  static handleSuspend = async () => {
    this.stopPollLoop();
    this.onlineStatus = false;

    await AppOrchestrator.next({
      task: 'app:initialize:offline',
    });
  };

  /**
   * @name handleResume
   * @summary Called when the system is resumed from being suspended.
   * Starts the poll and initializes the app based on its online status.
   */
  static handleResume = async () => {
    const status = await this.isConnected();
    this.onlineStatus = status;

    // Initialize app in the correct mode.
    await AppOrchestrator.next({
      task: `app:initialize:${status ? 'online' : 'offline'}`,
    });

    // Start a new polling interval.
    this.stopPollLoop();
    await this.initialize();
  };
}
