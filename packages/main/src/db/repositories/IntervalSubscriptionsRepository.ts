// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type { ChainID } from '@polkadot-live/types/chains';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned from the `interval_subscriptions` table.
 */
interface IntervalSubscriptionRow {
  id: number;
  action: string;
  interval_setting: string;
  tick_counter: number;
  category: string;
  chain_id: string;
  label: string;
  status: string;
  enable_os_notifications: number;
  help_key: string;
  referendum_id: number | null;
  just_built: number;
}

/**
 * @name IntervalSubscriptionsRepository
 * @summary Data-access layer for the `interval_subscriptions` table.
 *
 * Provides typed CRUD operations using prepared statements for performance.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class IntervalSubscriptionsRepository {
  private static stmtInsert: BetterSqlite3.Statement | null = null;
  private static stmtGetAll: BetterSqlite3.Statement | null = null;
  private static stmtClear: BetterSqlite3.Statement | null = null;
  private static stmtDeleteByChainAndRefId: BetterSqlite3.Statement | null =
    null;
  private static db: BetterSqlite3.Database | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();
    IntervalSubscriptionsRepository.db = db;

    IntervalSubscriptionsRepository.stmtInsert = db.prepare(`
      INSERT OR REPLACE INTO interval_subscriptions
        (action, interval_setting, tick_counter, category, chain_id, label, status, enable_os_notifications, help_key, referendum_id, just_built)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    IntervalSubscriptionsRepository.stmtGetAll = db.prepare(
      'SELECT * FROM interval_subscriptions ORDER BY chain_id, action',
    );

    IntervalSubscriptionsRepository.stmtClear = db.prepare(
      'DELETE FROM interval_subscriptions',
    );

    IntervalSubscriptionsRepository.stmtDeleteByChainAndRefId = db.prepare(
      'DELETE FROM interval_subscriptions WHERE chain_id = ? AND referendum_id = ?',
    );
  }

  /**
   * Insert or replace an interval subscription task.
   */
  static set(task: IntervalSubscription): void {
    const intervalSettingJson = JSON.stringify(task.intervalSetting);
    IntervalSubscriptionsRepository.stmtInsert!.run(
      task.action,
      intervalSettingJson,
      task.tickCounter,
      task.category,
      task.chainId,
      task.label,
      task.status,
      task.enableOsNotifications ? 1 : 0,
      task.helpKey,
      task.referendumId ?? null,
      task.justBuilt ? 1 : 0,
    );
  }

  /**
   * Update an existing interval subscription task.
   */
  static update(task: IntervalSubscription): void {
    if (!IntervalSubscriptionsRepository.db) {
      throw new Error('Database not initialized');
    }

    // Use dynamic SQL to properly handle NULL referendum_id comparison
    const whereClause =
      task.referendumId !== undefined
        ? `WHERE action = ? AND chain_id = ? AND referendum_id = ?`
        : `WHERE action = ? AND chain_id = ? AND referendum_id IS NULL`;

    const stmt = IntervalSubscriptionsRepository.db!.prepare(`
      UPDATE interval_subscriptions
      SET interval_setting = ?, tick_counter = ?, category = ?,
          label = ?, status = ?, enable_os_notifications = ?, help_key = ?, just_built = ?
      ${whereClause}
    `);

    const intervalSettingJson = JSON.stringify(task.intervalSetting);
    const params =
      task.referendumId !== undefined
        ? [
            intervalSettingJson,
            task.tickCounter,
            task.category,
            task.label,
            task.status,
            task.enableOsNotifications ? 1 : 0,
            task.helpKey,
            task.justBuilt ? 1 : 0,
            task.action,
            task.chainId,
            task.referendumId,
          ]
        : [
            intervalSettingJson,
            task.tickCounter,
            task.category,
            task.label,
            task.status,
            task.enableOsNotifications ? 1 : 0,
            task.helpKey,
            task.justBuilt ? 1 : 0,
            task.action,
            task.chainId,
          ];

    stmt.run(...params);
  }

  /**
   * Get all interval subscription tasks as serialized JSON array.
   * Returns '[]' if no tasks exist.
   */
  static getAll(): string {
    const rows =
      IntervalSubscriptionsRepository.stmtGetAll!.all() as IntervalSubscriptionRow[];

    if (rows.length === 0) {
      return '[]';
    }

    const tasks = rows.map((row) => rowToTask(row));
    return JSON.stringify(tasks);
  }

  /**
   * Delete a single interval subscription task by action, chain, and referendum ID.
   */
  static delete(action: string, chainId: ChainID, referendumId?: number): void {
    if (!IntervalSubscriptionsRepository.db) {
      throw new Error('Database not initialized');
    }

    const whereClause =
      referendumId !== undefined
        ? `WHERE action = ? AND chain_id = ? AND referendum_id = ?`
        : `WHERE action = ? AND chain_id = ? AND referendum_id IS NULL`;

    const stmt = IntervalSubscriptionsRepository.db!.prepare(
      `DELETE FROM interval_subscriptions ${whereClause}`,
    );

    if (referendumId !== undefined) {
      stmt.run(action, chainId, referendumId);
    } else {
      stmt.run(action, chainId);
    }
  }

  /**
   * Clear all interval subscription tasks.
   */
  static clear(): void {
    IntervalSubscriptionsRepository.stmtClear!.run();
  }

  /**
   * Delete all tasks for a specific chain and referendum ID.
   */
  static deleteByChainAndRefId(chainId: ChainID, referendumId: number): void {
    IntervalSubscriptionsRepository.stmtDeleteByChainAndRefId!.run(
      chainId,
      referendumId,
    );
  }
}

/**
 * Convert a database row to an IntervalSubscription object.
 */
function rowToTask(row: IntervalSubscriptionRow): IntervalSubscription {
  return {
    action: row.action,
    intervalSetting: JSON.parse(row.interval_setting),
    tickCounter: row.tick_counter,
    category: row.category,
    chainId: row.chain_id as ChainID,
    label: row.label,
    status: row.status as 'enable' | 'disable',
    enableOsNotifications: row.enable_os_notifications === 1,
    helpKey: row.help_key as HelpItemKey,
    referendumId: row.referendum_id ?? undefined,
    justBuilt: row.just_built === 1 ? true : undefined,
  };
}
