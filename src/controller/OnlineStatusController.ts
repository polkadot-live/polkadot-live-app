// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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

    await this.startPollLoop();
  }

  private static startPollLoop = async () => {
    const interval = 5000;

    this.intervalId = setInterval(async () => {
      console.log(`Connection status: ${await this.isConnected()}`);
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
