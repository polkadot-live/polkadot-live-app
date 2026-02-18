// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import http2 from 'node:http2';
import { WindowsController } from './WindowsController';
import type { IpcTask } from '@polkadot-live/types/communication';

export class OnlineStatusController {
  private static onlineStatus = false;
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * @name processAsync
   * @summary Handle connection tasks received from renderer and return a value.
   */
  static async processAsync(task: IpcTask): Promise<boolean | undefined> {
    switch (task.action) {
      // Handle initializing online status controller.
      case 'connection:init': {
        await OnlineStatusController.initialize();
        return;
      }
      // Get connection status and send to frontend.
      case 'connection:getStatus': {
        return OnlineStatusController.getStatus();
      }
    }
  }

  /**
   * @name getStatus
   * @summary Returns the cached online status.
   */
  static getStatus(): boolean {
    return OnlineStatusController.onlineStatus;
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
      status ? await this.initializeOnline() : await this.initializeOffline();

      // Re-initialize class if app goes offline to prevent stalling
      // upon calling `isConnected`.
      //if (!status && this.intervalId) {
      //  this.stopPollLoop();
      //  await this.initialize();
      //}
    }
  };

  /**
   * @name initialize
   * @summary Set connection status and start connection polling loop.
   */
  static async initialize() {
    OnlineStatusController.onlineStatus =
      await OnlineStatusController.isConnected();
    //this.startPollLoop();
  }

  /**
   * @name isConnected
   * @summary Function to check if internet is available.
   */
  private static isConnected = (): Promise<boolean> =>
    new Promise((resolve) => {
      const client = http2.connect('https://www.google.com');
      client.on('connect', () => {
        resolve(true);
        client.destroy();
      });
      client.on('error', () => {
        resolve(false);
        client.destroy();
      });
    });

  /**
   * @name startPoll
   * @summary Calls a connection handling function after a set interval for
   * handling offline and online status changes.
   */

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Keep for now.
  private static startPollLoop = () => {
    const interval = 5000;
    this.intervalId = setInterval(this.handleStatusChange, interval);
  };

  /**
   * @name stopPoll
   * @summary Stop the connection polling interval.
   */

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Keep for now.
  private static stopPollLoop = async () =>
    this.intervalId && clearInterval(this.intervalId);

  /**
   * @name handleSuspend
   * @summary Called when the system is suspended. Stops the poll loop and
   * sets the app to offline mode.
   */
  static handleSuspend = async () => {
    //this.stopPollLoop();
    this.onlineStatus = false;
    await this.initializeOffline();
  };

  /**
   * @name handleResume
   * @summary Called when the system is resumed from being suspended.
   * Starts the poll and initializes the app based on its online status.
   */
  static handleResume = async () => {
    const status = await this.isConnected();
    this.onlineStatus = status;
    status ? await this.initializeOnline() : await this.initializeOffline();

    // Start a new polling interval.
    //this.stopPollLoop();
    await this.initialize();
  };

  /**
   * @name initializeOffline
   * @summary Sets the app's state correctly for offline mode.
   */
  private static async initializeOffline() {
    WindowsController.getWindow('menu')?.webContents?.send(
      'renderer:app:initialize:offline',
    );
  }

  /**
   * @name initializeOnline
   * @summary Sets the app's state correctly for online mode.
   */
  private static async initializeOnline() {
    WindowsController.getWindow('menu')?.webContents?.send(
      'renderer:app:initialize:online',
    );
  }
}
