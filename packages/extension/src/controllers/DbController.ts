// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { openDB } from 'idb';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import { getSupportedSources } from '@polkadot-live/consts/chains';

interface MyDB extends DBSchema {
  accounts: {
    key: AccountSource;
    value: ImportedGenericAccount[];
  };
  settings: {
    key: string;
    value: boolean;
  };
}

export type Stores = 'settings' | 'accounts';

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
        const accountsStore = db.createObjectStore('accounts');
        for (const key of getSupportedSources()) {
          accountsStore.put([], key);
        }
        const settingsStore = db.createObjectStore('settings');
        for (const [key, value] of getDefaultSettings().entries()) {
          settingsStore.put(value, key);
        }
      },
    });
  }

  /**
   * Get value from database.
   */
  static async get(store: Stores, key: string) {
    return this.getDb().get(store, key);
  }

  /**
   * Set value in databse.
   */
  static async set(store: Stores, key: string, value: AnyData) {
    await this.getDb().put(store, value, key);
  }

  /**
   * Get all objects in a store.
   */
  static async getAll(storeName: Stores) {
    const map = new Map();
    let cursor = await this.getDb().transaction(storeName).store.openCursor();
    while (cursor) {
      map.set(cursor.key, cursor.value);
      cursor = await cursor.continue();
    }
    return JSON.stringify(Array.from(map.entries()));
  }
}
