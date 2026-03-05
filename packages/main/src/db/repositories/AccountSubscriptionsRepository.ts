// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type { ActiveSubCounts } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type {
  SubscriptionTask,
  TaskAction,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned when querying `account_subscriptions`.
 */
interface AccountSubscriptionRow {
  id: number;
  chain_id: string;
  address: string;
  action: string;
  api_call_as_string: string;
  category: string;
  enable_os_notifications: number;
  help_key: string;
  label: string;
  status: string;
  action_args: string | null;
}

/**
 * Parameters for subscription write operations.
 */
interface SubscriptionParams {
  chainId: ChainID;
  address: string;
  action: string;
}

/**
 * Parameters for setting a subscription task.
 */
interface SetSubscriptionParams extends SubscriptionParams {
  task: SubscriptionTask;
}

/**
 * @name AccountSubscriptionsRepository
 * @summary Data-access layer for the `account_subscriptions` table.
 *
 * Provides typed CRUD operations using prepared statements for performance.
 * Account identity is derived from the (chain_id, address) composite key
 * stored directly on each row.
 *
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class AccountSubscriptionsRepository {
  private static stmtInsert: BetterSqlite3.Statement | null = null;
  private static stmtUpdate: BetterSqlite3.Statement | null = null;
  private static stmtDelete: BetterSqlite3.Statement | null = null;
  private static stmtGetByChainAddressAction: BetterSqlite3.Statement | null =
    null;
  private static stmtGetByChainAndAddress: BetterSqlite3.Statement | null =
    null;
  private static stmtGetAll: BetterSqlite3.Statement | null = null;
  private static stmtClearAddress: BetterSqlite3.Statement | null = null;
  private static stmtAccountStats: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    AccountSubscriptionsRepository.stmtInsert = db.prepare(`
      INSERT INTO account_subscriptions
        (chain_id, address, action, api_call_as_string, category, enable_os_notifications, help_key, label, status, action_args)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    AccountSubscriptionsRepository.stmtUpdate = db.prepare(`
      UPDATE account_subscriptions
      SET api_call_as_string = ?, category = ?, enable_os_notifications = ?,
          help_key = ?, label = ?, status = ?, action_args = ?
      WHERE chain_id = ? AND address = ? AND action = ?
    `);

    AccountSubscriptionsRepository.stmtDelete = db.prepare(
      'DELETE FROM account_subscriptions WHERE chain_id = ? AND address = ? AND action = ?',
    );

    AccountSubscriptionsRepository.stmtGetByChainAddressAction = db.prepare(
      'SELECT id FROM account_subscriptions WHERE chain_id = ? AND address = ? AND action = ?',
    );

    AccountSubscriptionsRepository.stmtGetByChainAndAddress = db.prepare(`
      SELECT * FROM account_subscriptions
      WHERE chain_id = ? AND address = ?
      ORDER BY action
    `);

    AccountSubscriptionsRepository.stmtGetAll = db.prepare(`
      SELECT * FROM account_subscriptions
      ORDER BY chain_id, address, action
    `);

    AccountSubscriptionsRepository.stmtClearAddress = db.prepare(
      'DELETE FROM account_subscriptions WHERE chain_id = ? AND address = ?',
    );

    AccountSubscriptionsRepository.stmtAccountStats = db.prepare(`
      SELECT chain_id || ':' || address AS key,
             COUNT(*) AS active,
             SUM(enable_os_notifications) AS osNotify
      FROM account_subscriptions
      GROUP BY chain_id, address
    `);
  }

  /**
   * Insert or update a subscription task for an account.
   *
   * Uses SELECT-then-INSERT/UPDATE so that existing rows keep their id
   * (SQLite's `INSERT OR REPLACE` would DELETE + INSERT, changing the id).
   */
  static set(params: Readonly<SetSubscriptionParams>): void {
    const { chainId, address, action, task } = params;

    const actionArgsJson = task.actionArgs
      ? JSON.stringify(task.actionArgs)
      : null;

    const existing =
      AccountSubscriptionsRepository.stmtGetByChainAddressAction!.get(
        chainId,
        address,
        action,
      ) as { id: number } | undefined;

    if (existing) {
      AccountSubscriptionsRepository.stmtUpdate!.run(
        task.apiCallAsString,
        task.category,
        task.enableOsNotifications ? 1 : 0,
        task.helpKey,
        task.label,
        task.status,
        actionArgsJson,
        chainId,
        address,
        action,
      );
    } else {
      AccountSubscriptionsRepository.stmtInsert!.run(
        chainId,
        address,
        action,
        task.apiCallAsString,
        task.category,
        task.enableOsNotifications ? 1 : 0,
        task.helpKey,
        task.label,
        task.status,
        actionArgsJson,
      );
    }
  }

  /**
   * Get all subscription tasks for an account as serialized JSON array.
   * Returns '[]' if no tasks exist.
   */
  static getForAddress(chainId: ChainID, address: string): string {
    const rows = AccountSubscriptionsRepository.stmtGetByChainAndAddress!.all(
      chainId,
      address,
    ) as AccountSubscriptionRow[];

    if (rows.length === 0) {
      return '[]';
    }

    const tasks = rows.map((row) => rowToTask(row));
    return JSON.stringify(tasks);
  }

  /**
   * Get all account subscriptions as a Map<`chainId:address`, SubscriptionTask[]>.
   * Serialized as JSON for compatibility with backup export format.
   */
  static getAllForBackup(): string {
    const rows =
      AccountSubscriptionsRepository.stmtGetAll!.all() as AccountSubscriptionRow[];
    const map = new Map<string, SubscriptionTask[]>();

    for (const row of rows) {
      const key = `${row.chain_id}:${row.address}`;
      const task = rowToTask(row);

      const existing = map.get(key) || [];
      existing.push(task);
      map.set(key, existing);
    }

    // Serialize task arrays to JSON strings so the backup format is
    // [string, string][] — matching what the import side expects.
    const stringMap = new Map<string, string>();
    for (const [key, tasks] of map.entries()) {
      stringMap.set(key, JSON.stringify(tasks));
    }

    return JSON.stringify(Array.from(stringMap.entries()));
  }

  /**
   * Delete a single subscription task for an account.
   */
  static delete(params: Readonly<SubscriptionParams>): void {
    const { chainId, address, action } = params;
    AccountSubscriptionsRepository.stmtDelete!.run(chainId, address, action);
  }

  /**
   * Clear all subscription tasks for an account.
   */
  static clearForAddress(chainId: ChainID, address: string): void {
    AccountSubscriptionsRepository.stmtClearAddress!.run(chainId, address);
  }

  /**
   * Get account stats (active subscriptions and os notify counts) for accounts.
   */
  static getAccountStats(): Record<string, ActiveSubCounts> {
    const rows = AccountSubscriptionsRepository.stmtAccountStats!.all() as {
      key: string;
      active: number;
      osNotify: number;
    }[];
    const result: Record<string, ActiveSubCounts> = {};
    for (const row of rows) {
      result[row.key] = { active: row.active, osNotify: row.osNotify };
    }
    return result;
  }
}

/**
 * Convert a database row to a SubscriptionTask object.
 */
function rowToTask(row: AccountSubscriptionRow): SubscriptionTask {
  return {
    action: row.action as TaskAction,
    apiCallAsString: row.api_call_as_string,
    actionArgs: row.action_args ? JSON.parse(row.action_args) : undefined,
    category: row.category as TaskCategory,
    chainId: row.chain_id as ChainID,
    label: row.label,
    status: row.status as 'enable' | 'disable',
    enableOsNotifications: row.enable_os_notifications === 1,
    helpKey: row.help_key as HelpItemKey,
    accountAddress: row.address,
  };
}
