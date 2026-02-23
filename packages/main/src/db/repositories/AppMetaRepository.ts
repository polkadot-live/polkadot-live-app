// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * @name AppMetaRepository
 * @summary Data-access layer for the `app_meta` table.
 *
 * Handles application-level metadata like disclaimer flag and version tracking.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class AppMetaRepository {
  private static stmtGet: BetterSqlite3.Statement | null = null;
  private static stmtSet: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();
    AppMetaRepository.stmtGet = db.prepare(
      'SELECT value FROM app_meta WHERE key = ?',
    );
    AppMetaRepository.stmtSet = db.prepare(
      'INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)',
    );
  }

  /**
   * Get a metadata value by key.
   */
  static get(key: string): number | null {
    const row = AppMetaRepository.stmtGet!.get(key) as
      | { value: number }
      | undefined;
    return row ? row.value : null;
  }

  /**
   * Set a metadata value by key (upsert).
   */
  static set(key: string, value: number): void {
    AppMetaRepository.stmtSet!.run(key, value);
  }

  /**
   * Get the disclaimer shown flag (0 = not shown, 1 = shown).
   */
  static getDisclaimerShown(): boolean {
    const value = AppMetaRepository.get('disclaimer_shown');
    return value === 1;
  }

  /**
   * Set the disclaimer shown flag.
   */
  static setDisclaimerShown(shown: boolean): void {
    AppMetaRepository.set('disclaimer_shown', shown ? 1 : 0);
  }
}
