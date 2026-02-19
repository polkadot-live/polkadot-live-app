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
    label: 'Initialize database schema',
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

      // Raw addresses — one row per generic account (keyed by public key hex).
      db.exec(`
        CREATE TABLE IF NOT EXISTS raw_addresses (
          public_key_hex    TEXT PRIMARY KEY,
          account_name      TEXT NOT NULL,
          source            TEXT NOT NULL,
          encoded_accounts  TEXT NOT NULL
        );
      `);

      // Imported (managed) accounts — one row per address+chain combination.
      db.exec(`
        CREATE TABLE IF NOT EXISTS imported_accounts (
          address TEXT NOT NULL,
          chain_id TEXT NOT NULL,
          name    TEXT NOT NULL,
          source  TEXT NOT NULL,
          PRIMARY KEY (address, chain_id)
        );
      `);

      // Events table — stores persisted events.
      db.exec(`
        CREATE TABLE IF NOT EXISTS events (
          uid TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          task_action TEXT NOT NULL,
          who_origin TEXT NOT NULL,
          who_data TEXT NOT NULL,
          title TEXT NOT NULL,
          subtitle TEXT NOT NULL,
          data TEXT,
          timestamp INTEGER NOT NULL,
          tx_actions TEXT,
          uri_actions TEXT,
          stale INTEGER NOT NULL DEFAULT 0,
          encoded_info TEXT
        );
      `);

      // Extrinsics table — stores persisted extrinsics.
      db.exec(`
        CREATE TABLE IF NOT EXISTS extrinsics (
          tx_id TEXT PRIMARY KEY,
          action_meta TEXT NOT NULL,
          estimated_fee TEXT,
          tx_status TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          dynamic_info TEXT
        );
      `);
    },
  },
];
