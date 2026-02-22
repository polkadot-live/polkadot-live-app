// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { existsSync, unlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { migrations } from './migrations';
import {
  AccountSubscriptionsRepository,
  AccountsRepository,
  AddressesRepository,
  AppMetaRepository,
  ChainEventsRepository,
  ChainSubscriptionsRepository,
  EventsRepository,
  ExtrinsicsRepository,
  IntervalSubscriptionsRepository,
  SettingsRepository,
  SubscriptionAccountsRepository,
  WindowStateRepository,
} from './repositories';
import type BetterSqlite3 from 'better-sqlite3';
import type { Migration } from './migrations';

/**
 * Lazy-loaded reference to the better-sqlite3 constructor.
 * Loaded on first call to `initialize()` rather than at import time,
 * so that the native addon is resolved after Electron is fully started.
 */
let Database: typeof BetterSqlite3 | null = null;

const DB_FILENAME = 'polkadot-live.db';

/**
 * @name DatabaseManager
 * @summary Singleton manager for the application's SQLite database.
 *
 * Handles database lifecycle (open, close), applies schema migrations using
 * SQLite's `PRAGMA user_version`, and provides access to the underlying
 * `better-sqlite3` instance for repository classes.
 */
export class DatabaseManager {
  private static db: BetterSqlite3.Database | null = null;

  /**
   * Initialize database and all repository instances.
   * Must be called once during app startup, before any repository is used.
   */
  static initializeAll(userDataPath: string): void {
    // Clean up deprecated electron-store file
    DatabaseManager.removeDeprecatedElectronStore(userDataPath);

    DatabaseManager.initialize(userDataPath);
    AppMetaRepository.initialize();
    SettingsRepository.initialize();
    AddressesRepository.initialize();
    AccountsRepository.initialize();
    SubscriptionAccountsRepository.initialize();
    AccountSubscriptionsRepository.initialize();
    ChainSubscriptionsRepository.initialize();
    IntervalSubscriptionsRepository.initialize();
    EventsRepository.initialize();
    ExtrinsicsRepository.initialize();
    ChainEventsRepository.initialize();
    WindowStateRepository.initialize();
  }

  /**
   * Open (or create) the database at `<userDataPath>/polkadot-live.db`,
   * enable WAL journal mode and foreign keys, then run any pending migrations.
   *
   * Must be called once during app startup. Prefer `initializeAll()` for full initialization.
   */
  static initialize(userDataPath: string): void {
    if (DatabaseManager.db) {
      return; // Already initialized.
    }

    // Lazy-load the native addon on first use.
    if (!Database) {
      const req = createRequire(import.meta.url);
      Database = req('better-sqlite3');
    }

    const dbPath = join(userDataPath, DB_FILENAME);
    const db = new Database!(dbPath);

    // Performance: WAL journal allows concurrent reads while writing.
    db.pragma('journal_mode = WAL');

    // Integrity: enforce foreign key constraints.
    db.pragma('foreign_keys = ON');

    DatabaseManager.db = db;
    DatabaseManager.runMigrations();
  }

  /**
   * Return the open database instance.
   * @throws If `initialize()` has not been called.
   */
  static getDb(): BetterSqlite3.Database {
    if (!DatabaseManager.db) {
      throw new Error(
        'DatabaseManager not initialized — call initialize() first.',
      );
    }
    return DatabaseManager.db;
  }

  /**
   * Close the database connection. Call on `app.will-quit`.
   */
  static close(): void {
    if (DatabaseManager.db) {
      DatabaseManager.db.close();
      DatabaseManager.db = null;
    }
  }

  /**
   * Run pending migrations by comparing `PRAGMA user_version` against the
   * ordered migration list. Each migration's `up` function executes inside a
   * transaction for atomicity.
   */
  private static runMigrations(): void {
    const db = DatabaseManager.getDb();
    const currentVersion = db.pragma('user_version', {
      simple: true,
    }) as number;

    const pending = migrations.filter(
      (m: Migration) => m.version > currentVersion,
    );

    for (const migration of pending) {
      db.transaction(() => {
        migration.up(db);
        db.pragma(`user_version = ${migration.version}`);
      })();
    }
  }

  /**
   * Remove deprecated electron-store config file if it exists.
   * Called during initialization to clean up files from previous versions.
   */
  private static removeDeprecatedElectronStore(userDataPath: string): void {
    const configFilePath = join(userDataPath, 'config.json');
    try {
      if (existsSync(configFilePath)) {
        unlinkSync(configFilePath);
      }
    } catch (err) {
      // Silently ignore if cleanup fails
      console.warn('Failed to remove deprecated electron-store file:', err);
    }
  }
}
