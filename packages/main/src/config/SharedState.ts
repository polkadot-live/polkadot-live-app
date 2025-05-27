// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SyncID } from '@polkadot-live/types/communication';

export class SharedState {
  /**
   * Cache with default values.
   */
  private static cache = new Map<SyncID, boolean>([
    ['account:importing', false],
    ['backup:exporting', false],
    ['backup:importing', false],
    ['extrinsic:building', false],
    ['mode:online', false],
    ['wc:account:approved', false],
    ['wc:account:verifying', false],
    ['wc:connecting', false],
    ['wc:disconnecting', false],
    ['wc:initialized', false],
    ['wc:session:restored', false],
  ]);

  /**
   * Get a cached value or `false` if it doesn't exist.
   */
  static get = (key: SyncID): boolean => this.cache.get(key) || false;

  /**
   * Set a cached value.
   */
  static set = (key: SyncID, value: boolean) => this.cache.set(key, value);

  /**
   * Get all WalletConnect flags.
   */
  static getWcFlags = () => ({
    wcAccountApproved: Boolean(this.get('wc:account:approved')),
    wcConnecting: Boolean(this.get('wc:account:approved')),
    wcDisconnecting: Boolean(this.get('wc:account:approved')),
    wcInitialized: Boolean(this.get('wc:account:approved')),
    wcSessionRestored: Boolean(this.get('wc:account:approved')),
    wcVerifyingAccount: Boolean(this.get('wc:account:approved')),
  });
}
