// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsService } from './service';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FrameSystemEventRecord } from '@polkadot-live/types';

interface QueueItem {
  chainId: ChainID;
  record: FrameSystemEventRecord;
  osNotify: boolean;
}

export class EventQueue {
  private static queue: QueueItem[] = [];
  private static isProcessing = false;
  private static delay = 750;
  private static maxQueueSize = 500;

  static push(item: QueueItem) {
    if (this.queue.length > this.maxQueueSize) {
      console.warn('EventQueue overflow: trimming oldest events');
      this.queue.splice(0, this.queue.length - this.maxQueueSize);
    }
    this.queue.push(item);
    this.process();
  }

  private static async process() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    while (this.queue.length > 0) {
      try {
        const { chainId, osNotify, record } = this.queue.shift()!;
        ChainEventsService.processSingleEvent(chainId, osNotify, record);

        // Yield control to allow UI updates to flush.
        if (EventQueue.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, EventQueue.delay));
        }
      } catch (err) {
        console.error('Error processing event', err);
      }
    }
    this.isProcessing = false;
  }
}
