// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AppOrchestrator } from '@/orchestrators/AppOrchestrator';
import dns from 'dns';

export class OnlineStatusController {
  private static onlineStatus = false;
  private static intervalId: NodeJS.Timeout | null = null;

  static getStatus(): boolean {
    return this.onlineStatus;
  }

  /**
   * @name initialize
   * @summary Set connection status and start connection polling loop.
   */
  static async initialize() {
    // Determine whether app is online or offline.
    console.log(`Internet available: ${await this.isConnected()}`);

    this.onlineStatus = await this.isConnected();

    this.startPollLoop();
  }

  /**
   * @name startPoll
   * @summary Checks connection status after a set interval and calls appropriate
   * app task depending on whether the app has gone offline or online.
   */
  private static startPollLoop = () => {
    const interval = 5000;

    this.intervalId = setInterval(async () => {
      const status = await this.isConnected();

      // Update app state if online status has changed.
      if (status !== this.onlineStatus) {
        this.onlineStatus = status;

        console.log(`Online status changed to: ${status}`);

        await AppOrchestrator.next({
          task: `app:initialize:${status ? 'online' : 'offline'}`,
        });
      }
    }, interval);
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
}
