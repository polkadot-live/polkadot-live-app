// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type BetterSqlite3 from 'better-sqlite3';
import type { Rectangle } from 'electron';

/**
 * @name WindowStateRepository
 * @summary Data-access layer for the `window_state` table.
 *
 * Persists and retrieves window position and size data for the menu window.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class WindowStateRepository {
  private static stmtGet: BetterSqlite3.Statement | null = null;
  private static stmtSet: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    WindowStateRepository.stmtGet = db.prepare(
      'SELECT x, y, width, height FROM window_state WHERE window_id = ?',
    );
    WindowStateRepository.stmtSet = db.prepare(
      'INSERT OR REPLACE INTO window_state (window_id, x, y, width, height) VALUES (?, ?, ?, ?, ?)',
    );
  }

  /**
   * Get window bounds for a given window ID.
   * Returns `null` if no record exists.
   */
  static get(windowId: string): Rectangle | null {
    const row = WindowStateRepository.stmtGet!.get(windowId) as
      | { x: number; y: number; width: number; height: number }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      x: row.x,
      y: row.y,
      width: row.width,
      height: row.height,
    };
  }

  /**
   * Set (insert or update) window bounds for a given window ID.
   */
  static set(windowId: string, bounds: Rectangle): void {
    WindowStateRepository.stmtSet!.run(
      windowId,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
    );
  }
}
