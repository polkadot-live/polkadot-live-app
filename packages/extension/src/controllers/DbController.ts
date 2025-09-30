// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { openDB } from 'idb';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import type { DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  settings: {
    key: string;
    value: boolean;
  };
}

export type Stores = 'settings';

export class DbController {
  private static DB_NAME = 'PolkadotLiveDB';
  private static db: IDBPDatabase<MyDB> | null = null;

  /**
   * Get database.
   */
  private static getDb(): IDBPDatabase<MyDB> {
    if (!this.db) {
      throw new Error('Database undefined');
    }
    return this.db;
  }

  /**
   * Initialized database.
   */
  static async initialize() {
    this.db = await openDB<MyDB>(this.DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore('settings');
        for (const [key, value] of getDefaultSettings().entries()) {
          store.put(value, key);
        }
      },
    });
    console.log('> Database initialized');
  }

  /**
   * Get value from database.
   */
  static async get(store: Stores, key: string) {
    return this.getDb().get(store, key);
  }
}
