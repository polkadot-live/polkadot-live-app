// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getDefaultSettings } from '@polkadot-live/consts/settings';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * A single migration step. Migrations are applied in order of `version`.
 */
export interface Migration {
  // Sequential version number (matches SQLite `PRAGMA user_version`).
  version: number;
  // Human-readable label for logging / debugging.
  label: string;
  // Called inside a transaction to apply the schema change.
  up: (db: BetterSqlite3.Database) => void;
}

/**
 * Ordered list of all database migrations.
 *
 * Rules:
 * - Always append new migrations at the end.
 * - Never modify or remove an existing migration.
 * - Each `version` must be strictly greater than the previous one.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    label: 'Create settings and app_meta tables',
    up: (db) => {
      // Application metadata (version tracking, flags).
      db.exec(`
        CREATE TABLE IF NOT EXISTS app_meta (
          key   TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

      // Per-key boolean settings (one row per setting).
      db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key   TEXT    PRIMARY KEY,
          value INTEGER NOT NULL DEFAULT 0
        );
      `);

      // Seed default settings.
      const insert = db.prepare(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      );

      for (const [key, value] of getDefaultSettings().entries()) {
        insert.run(key, value ? 1 : 0);
      }
    },
  },
];
