// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsService } from './service';
import type { FrameSystemEventRecord } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { WhoMeta } from './types';

interface QueueItem {
  chainId: ChainID;
  record: FrameSystemEventRecord;
  osNotify: boolean;
  whoMeta?: WhoMeta;
}

export class EventQueue {
  private static queue: QueueItem[] = [];
  private static isProcessing = false;
  private static delay = 750;
  private static maxQueueSize = 500;

  static push(item: QueueItem) {
    if (EventQueue.queue.length > EventQueue.maxQueueSize) {
      console.warn('EventQueue overflow: trimming oldest events');
      EventQueue.queue.splice(
        0,
        EventQueue.queue.length - EventQueue.maxQueueSize,
      );
    }
    EventQueue.queue.push(item);
    EventQueue.process();
  }

  private static async process() {
    if (EventQueue.isProcessing) {
      return;
    }
    EventQueue.isProcessing = true;

    while (EventQueue.queue.length > 0) {
      try {
        const { chainId, osNotify, record, whoMeta } =
          EventQueue.queue.shift()!;
        ChainEventsService.processSingleEvent(
          chainId,
          osNotify,
          record,
          whoMeta,
        );
        // Yield control to allow UI updates to flush.
        if (EventQueue.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, EventQueue.delay));
        }
      } catch (err) {
        console.error('Error processing event', err);
      }
    }
    EventQueue.isProcessing = false;
  }
}
