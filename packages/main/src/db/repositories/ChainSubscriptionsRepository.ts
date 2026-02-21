// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type { ChainID } from '@polkadot-live/types/chains';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type {
  SubscriptionTask,
  TaskAction,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned from the `chain_subscriptions` table.
 */
interface ChainSubscriptionRow {
  id: number;
  chain_id: string;
  action: string;
  api_call_as_string: string;
  category: string;
  enable_os_notifications: number;
  help_key: string;
  label: string;
  status: string;
}

/**
 * @name ChainSubscriptionsRepository
 * @summary Data-access layer for the `chain_subscriptions` table.
 *
 * Provides typed CRUD operations using prepared statements for performance.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class ChainSubscriptionsRepository {
  private static stmtInsert: BetterSqlite3.Statement | null = null;
  private static stmtDelete: BetterSqlite3.Statement | null = null;
  private static stmtGetAll: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    ChainSubscriptionsRepository.stmtInsert = db.prepare(`
      INSERT OR REPLACE INTO chain_subscriptions
        (chain_id, action, api_call_as_string, category, enable_os_notifications, help_key, label, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    ChainSubscriptionsRepository.stmtDelete = db.prepare(
      'DELETE FROM chain_subscriptions WHERE chain_id = ? AND action = ?',
    );

    ChainSubscriptionsRepository.stmtGetAll = db.prepare(
      'SELECT * FROM chain_subscriptions ORDER BY chain_id, action',
    );
  }

  /**
   * Insert or replace a chain subscription task.
   */
  static set(task: SubscriptionTask): void {
    ChainSubscriptionsRepository.stmtInsert!.run(
      task.chainId,
      task.action,
      task.apiCallAsString,
      task.category,
      task.enableOsNotifications ? 1 : 0,
      task.helpKey,
      task.label,
      task.status,
    );
  }

  /**
   * Get all chain subscription tasks as serialized JSON array.
   * Returns '[]' if no tasks exist.
   */
  static getAll(): string {
    const rows =
      ChainSubscriptionsRepository.stmtGetAll!.all() as ChainSubscriptionRow[];

    if (rows.length === 0) {
      return '[]';
    }

    const tasks = rows.map((row) => rowToTask(row));
    return JSON.stringify(tasks);
  }

  /**
   * Delete a single chain subscription task.
   */
  static delete(task: SubscriptionTask): void {
    const { chainId, action } = task;
    ChainSubscriptionsRepository.stmtDelete!.run(chainId, action);
  }
}

/**
 * Convert a database row to a SubscriptionTask object.
 */
function rowToTask(row: ChainSubscriptionRow): SubscriptionTask {
  return {
    action: row.action as TaskAction,
    apiCallAsString: row.api_call_as_string,
    category: row.category as TaskCategory,
    chainId: row.chain_id as ChainID,
    label: row.label,
    status: row.status as 'enable' | 'disable',
    enableOsNotifications: row.enable_os_notifications === 1,
    helpKey: row.help_key as HelpItemKey,
  };
}
