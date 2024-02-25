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

  static async initialize() {
    // Determine whether app is online or offline.
    console.log(`Internet available: ${await this.isConnected()}`);

    this.onlineStatus = await this.isConnected();

    this.startPollLoop();
  }

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

  private static stopPollLoop = async () =>
    this.intervalId && clearInterval(this.intervalId);

  /**
   * @name isConnected
   * @summary One-liner function to check if internet is available.
   */
  private static isConnected = async () =>
    !!(await dns.promises.resolve('google.com').catch(() => false));
}
