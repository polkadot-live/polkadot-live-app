// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SyncID } from '@polkadot-live/types/communication';
import { initSharedState } from '@polkadot-live/consts/sharedState';

export class SharedState {
  /**
   * Cache with default values.
   */
  private static cache = new Map<SyncID, boolean>();

  /**
   * Initialize shared state cache.
   */
  static initialize = (connected: boolean) => {
    this.cache = initSharedState()
      .set('mode:connected', connected)
      .set('mode:online', connected);
  };

  /**
   * Get a cached value or `false` if it doesn't exist.
   */
  static get = (key: SyncID): boolean => this.cache.get(key) || false;

  /**
   * Set a cached value.
   */
  static set = (key: SyncID, value: boolean) => this.cache.set(key, value);
}
