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
  private static stmtUpdateWithRef: BetterSqlite3.Statement | null = null;
  private static stmtUpdateNullRef: BetterSqlite3.Statement | null = null;
  private static stmtExistsWithRef: BetterSqlite3.Statement | null = null;
  private static stmtExistsNullRef: BetterSqlite3.Statement | null = null;
  private static stmtDeleteWithRef: BetterSqlite3.Statement | null = null;
  private static stmtDeleteNullRef: BetterSqlite3.Statement | null = null;
  private static stmtGetAll: BetterSqlite3.Statement | null = null;
  private static stmtClear: BetterSqlite3.Statement | null = null;
  private static stmtDeleteByChainAndRefId: BetterSqlite3.Statement | null =
    null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   *
   * The UNIQUE constraint is `(chain_id, action, referendum_id)`. Because
   * SQLite treats each NULL as distinct, queries that target rows where
   * `referendum_id IS NULL` need a separate prepared statement from those
   * that compare against a concrete value.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    IntervalSubscriptionsRepository.stmtInsert = db.prepare(`
      INSERT INTO interval_subscriptions
        (action, interval_setting, tick_counter, category, chain_id, label,
         status, enable_os_notifications, help_key, referendum_id, just_built)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // --- UPDATE pairs (with / without referendum_id) ---

    const updateCols = `
      UPDATE interval_subscriptions
      SET interval_setting = ?, tick_counter = ?, category = ?,
          label = ?, status = ?, enable_os_notifications = ?,
          help_key = ?, just_built = ?`;

    IntervalSubscriptionsRepository.stmtUpdateWithRef = db.prepare(
      `${updateCols} WHERE action = ? AND chain_id = ? AND referendum_id = ?`,
    );

    IntervalSubscriptionsRepository.stmtUpdateNullRef = db.prepare(
      `${updateCols} WHERE action = ? AND chain_id = ? AND referendum_id IS NULL`,
    );

    // --- EXISTS pairs (with / without referendum_id) ---

    IntervalSubscriptionsRepository.stmtExistsWithRef = db.prepare(
      'SELECT id FROM interval_subscriptions WHERE chain_id = ? AND action = ? AND referendum_id = ?',
    );

    IntervalSubscriptionsRepository.stmtExistsNullRef = db.prepare(
      'SELECT id FROM interval_subscriptions WHERE chain_id = ? AND action = ? AND referendum_id IS NULL',
    );

    // --- DELETE pairs (with / without referendum_id) ---

    IntervalSubscriptionsRepository.stmtDeleteWithRef = db.prepare(
      'DELETE FROM interval_subscriptions WHERE action = ? AND chain_id = ? AND referendum_id = ?',
    );

    IntervalSubscriptionsRepository.stmtDeleteNullRef = db.prepare(
      'DELETE FROM interval_subscriptions WHERE action = ? AND chain_id = ? AND referendum_id IS NULL',
    );

    // --- Other ---

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
   * Insert or update an interval subscription task.
   *
   * Checks for an existing row first and updates it in place to preserve
   * the row id. Falls back to INSERT for new rows.
   */
  static set(task: IntervalSubscription): void {
    const existing = IntervalSubscriptionsRepository.exists(task);

    if (existing) {
      IntervalSubscriptionsRepository.runUpdate(task);
    } else {
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
  }

  /**
   * Update an existing interval subscription task.
   */
  static update(task: IntervalSubscription): void {
    IntervalSubscriptionsRepository.runUpdate(task);
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
    if (referendumId !== undefined) {
      IntervalSubscriptionsRepository.stmtDeleteWithRef!.run(
        action,
        chainId,
        referendumId,
      );
    } else {
      IntervalSubscriptionsRepository.stmtDeleteNullRef!.run(action, chainId);
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

  // ===== Private helpers =====

  /**
   * Check if a row exists matching the task's unique key.
   */
  private static exists(task: IntervalSubscription): boolean {
    if (task.referendumId !== undefined) {
      return (
        IntervalSubscriptionsRepository.stmtExistsWithRef!.get(
          task.chainId,
          task.action,
          task.referendumId,
        ) !== undefined
      );
    }
    return (
      IntervalSubscriptionsRepository.stmtExistsNullRef!.get(
        task.chainId,
        task.action,
      ) !== undefined
    );
  }

  /**
   * Run an UPDATE statement for the given task, choosing the correct
   * prepared statement based on whether `referendumId` is defined.
   */
  private static runUpdate(task: IntervalSubscription): void {
    const intervalSettingJson = JSON.stringify(task.intervalSetting);
    const setCols = [
      intervalSettingJson,
      task.tickCounter,
      task.category,
      task.label,
      task.status,
      task.enableOsNotifications ? 1 : 0,
      task.helpKey,
      task.justBuilt ? 1 : 0,
    ];

    if (task.referendumId !== undefined) {
      IntervalSubscriptionsRepository.stmtUpdateWithRef!.run(
        ...setCols,
        task.action,
        task.chainId,
        task.referendumId,
      );
    } else {
      IntervalSubscriptionsRepository.stmtUpdateNullRef!.run(
        ...setCols,
        task.action,
        task.chainId,
      );
    }
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
