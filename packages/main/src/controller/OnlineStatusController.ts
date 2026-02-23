// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import http2 from 'node:http2';
import { WindowsController } from './WindowsController';
import type { IpcTask } from '@polkadot-live/types/communication';

export class OnlineStatusController {
  private static onlineStatus = false;

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

  // Returns the cached online status.
  static getStatus(): boolean {
    return OnlineStatusController.onlineStatus;
  }

  // Check and handle changes in connection status.
  static handleStatusChange = async () => {
    const status = await this.isConnected();

    if (status !== this.onlineStatus) {
      this.onlineStatus = status;
      console.log(`Online status changed to ${status}`);
      status ? await this.initializeOnline() : await this.initializeOffline();
    }
  };

  // Set connection status.
  static async initialize() {
    OnlineStatusController.onlineStatus =
      await OnlineStatusController.isConnected();
  }

  // Checks if internet is available.
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

  // Handle system suspend.
  static handleSuspend = async () => {
    this.onlineStatus = false;
    await this.initializeOffline();
  };

  // Handle system resume.
  static handleResume = async () => {
    const status = await this.isConnected();
    this.onlineStatus = status;
    status ? await this.initializeOnline() : await this.initializeOffline();
    await this.initialize();
  };

  // Set state correctly for offline mode.
  private static async initializeOffline() {
    WindowsController.getWindow('menu')?.webContents?.send(
      'renderer:app:initialize:offline',
    );
  }

  // Set state correctly for online mode.
  private static async initializeOnline() {
    WindowsController.getWindow('menu')?.webContents?.send(
      'renderer:app:initialize:online',
    );
  }
}
