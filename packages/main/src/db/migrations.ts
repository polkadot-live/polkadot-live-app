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
          value INTEGER NOT NULL
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

      // Account subscriptions table — stores subscription tasks per account+chain.
      db.exec(`
        CREATE TABLE IF NOT EXISTS account_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chain_id TEXT NOT NULL,
          address TEXT NOT NULL,
          action TEXT NOT NULL,
          task_data TEXT NOT NULL,
          UNIQUE (chain_id, address, action)
        );
      `);

      // Chain subscriptions table — stores global chain subscription tasks.
      db.exec(`
        CREATE TABLE IF NOT EXISTS chain_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chain_id TEXT NOT NULL,
          action TEXT NOT NULL,
          api_call_as_string TEXT NOT NULL,
          category TEXT NOT NULL,
          enable_os_notifications INTEGER NOT NULL,
          help_key TEXT NOT NULL,
          label TEXT NOT NULL,
          status TEXT NOT NULL,
          UNIQUE (chain_id, action)
        );
      `);

      // Interval subscriptions table — stores interval-based subscription tasks.
      db.exec(`
        CREATE TABLE IF NOT EXISTS interval_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          interval_setting TEXT NOT NULL,
          tick_counter INTEGER NOT NULL,
          category TEXT NOT NULL,
          chain_id TEXT NOT NULL,
          label TEXT NOT NULL,
          status TEXT NOT NULL,
          enable_os_notifications INTEGER NOT NULL DEFAULT 0,
          help_key TEXT NOT NULL,
          referendum_id INTEGER,
          just_built INTEGER NOT NULL DEFAULT 0,
          UNIQUE (chain_id, action, referendum_id)
        );
      `);

      // Chain event subscriptions table.
      db.exec(`
        CREATE TABLE IF NOT EXISTS chain_event_subscriptions (
          id TEXT NOT NULL,
          chain_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          pallet TEXT NOT NULL,
          event_name TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 0,
          os_notify INTEGER NOT NULL DEFAULT 0,
          label TEXT NOT NULL,
          event_data TEXT,
          help_key TEXT,
          scope_type TEXT NOT NULL,
          scope_id TEXT,
          PRIMARY KEY (id, scope_type, scope_id)
        );
      `);

      // Create indexes for common query patterns.
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_chain_events_chain_scope
        ON chain_event_subscriptions (chain_id, scope_type, scope_id);
      `);

      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_chain_events_pallet_event
        ON chain_event_subscriptions (pallet, event_name);
      `);

      // Chain event active refs cache.
      db.exec(`
        CREATE TABLE IF NOT EXISTS chain_event_active_refs (
          chain_id TEXT NOT NULL,
          ref_id INT NOT NULL,
          PRIMARY KEY (chain_id, ref_id)
        );
      `);

      // Window state — persists window position and size.
      db.exec(`
        CREATE TABLE IF NOT EXISTS window_state (
          window_id TEXT PRIMARY KEY,
          x INTEGER NOT NULL,
          y INTEGER NOT NULL,
          width INTEGER NOT NULL,
          height INTEGER NOT NULL
        );
      `);

      // Indexes for event queries performance.
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_events_timestamp_desc
        ON events (timestamp DESC);
      `);

      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_events_category
        ON events (category);
      `);
    },
  },
];
