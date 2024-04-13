// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@/types/misc';

export class TaskQueue {
  private static queue: (() => Promise<AnyData>)[] = [];
  private static executing = false;

  static add = (promiseGenerator: () => Promise<AnyData>) =>
    new Promise<AnyData>((resolve, reject) => {
      // The async function stored in the queue.
      const task = async () => {
        try {
          const result = await promiseGenerator();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.executing = false;
          this.next();
        }
      };

      this.queue.push(task);
      this.next();
    });

  private static next = () => {
    if (!this.executing && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        this.executing = true;
        task();
      }
    }
  };
}
