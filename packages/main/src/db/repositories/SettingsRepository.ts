// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type { SettingKey } from '@polkadot-live/types/settings';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * @name SettingsRepository
 * @summary Data-access layer for the `settings` table.
 *
 * Provides typed CRUD operations using prepared statements for performance.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class SettingsRepository {
  private static stmtGet: BetterSqlite3.Statement | null = null;
  private static stmtSet: BetterSqlite3.Statement | null = null;
  private static stmtGetAll: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    SettingsRepository.stmtGet = db.prepare(
      'SELECT value FROM settings WHERE key = ?',
    );
    SettingsRepository.stmtSet = db.prepare(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    );
    SettingsRepository.stmtGetAll = db.prepare(
      'SELECT key, value FROM settings',
    );
  }

  /**
   * Get a single setting value.
   * Returns `false` if the key does not exist.
   */
  static get(key: SettingKey): boolean {
    const row = SettingsRepository.stmtGet!.get(key) as
      | { value: number }
      | undefined;
    return row ? row.value === 1 : false;
  }

  /**
   * Set (insert or update) a single setting value.
   */
  static set(key: SettingKey, value: boolean): void {
    SettingsRepository.stmtSet!.run(key, value ? 1 : 0);
  }

  /**
   * Get all settings as a Map.
   */
  static getAll(): Map<SettingKey, boolean> {
    const rows = SettingsRepository.stmtGetAll!.all() as {
      key: SettingKey;
      value: number;
    }[];

    const map = new Map<SettingKey, boolean>();
    for (const row of rows) {
      map.set(row.key, row.value === 1);
    }
    return map;
  }
}
