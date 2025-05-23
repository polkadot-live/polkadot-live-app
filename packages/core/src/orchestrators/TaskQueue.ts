// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';

export class TaskQueue {
  private static queue: (() => Promise<AnyData>)[] = [];
  private static executing = false;

  static add = (promiseGenerator: () => Promise<AnyData>) => {
    // Wrap task in an async function.
    const task = async () => {
      await promiseGenerator();
      this.executing = false;

      // Call next to execute the next task.
      this.next();
    };

    // Add async function to queue.
    this.queue.push(task);
    this.next();
  };

  private static next = async () => {
    if (!this.executing && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        this.executing = true;
        await task();
      }
    }
  };
}
