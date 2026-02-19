// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned from the `account_subscriptions` table.
 */
interface AccountSubscriptionRow {
  id: number;
  chain_id: string;
  address: string;
  action: string;
  task_data: string;
}

/**
 * @name AccountSubscriptionsRepository
 * @summary Data-access layer for the `account_subscriptions` table.
 *
 * Provides typed CRUD operations using prepared statements for performance.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class AccountSubscriptionsRepository {
  private static stmtInsert: BetterSqlite3.Statement | null = null;
  private static stmtDelete: BetterSqlite3.Statement | null = null;
  private static stmtGetByChainAndAddress: BetterSqlite3.Statement | null =
    null;
  private static stmtGetAll: BetterSqlite3.Statement | null = null;
  private static stmtClearAddress: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    AccountSubscriptionsRepository.stmtInsert = db.prepare(`
      INSERT OR REPLACE INTO account_subscriptions
        (chain_id, address, action, task_data)
      VALUES (?, ?, ?, ?)
    `);

    AccountSubscriptionsRepository.stmtDelete = db.prepare(
      'DELETE FROM account_subscriptions WHERE chain_id = ? AND address = ? AND action = ?',
    );

    AccountSubscriptionsRepository.stmtGetByChainAndAddress = db.prepare(
      'SELECT task_data FROM account_subscriptions WHERE chain_id = ? AND address = ? ORDER BY action',
    );

    AccountSubscriptionsRepository.stmtGetAll = db.prepare(
      'SELECT chain_id, address, action, task_data FROM account_subscriptions ORDER BY chain_id, address, action',
    );

    AccountSubscriptionsRepository.stmtClearAddress = db.prepare(
      'DELETE FROM account_subscriptions WHERE chain_id = ? AND address = ?',
    );
  }

  /**
   * Insert or replace a subscription task for an account.
   */
  static set(
    chainId: ChainID,
    address: string,
    action: string,
    task: SubscriptionTask,
  ): void {
    const taskJson = JSON.stringify(task);
    AccountSubscriptionsRepository.stmtInsert!.run(
      chainId,
      address,
      action,
      taskJson,
    );
  }

  /**
   * Get all subscription tasks for an account as serialized JSON array.
   * Returns '[]' if no tasks exist.
   */
  static getForAddress(chainId: ChainID, address: string): string {
    const rows = AccountSubscriptionsRepository.stmtGetByChainAndAddress!.all(
      chainId,
      address,
    ) as { task_data: string }[];

    if (rows.length === 0) {
      return '[]';
    }

    const tasks = rows.map((row) => JSON.parse(row.task_data));
    return JSON.stringify(tasks);
  }

  /**
   * Get all subscription tasks for an account as deserialized objects.
   */
  static getForAddressDeserialized(
    chainId: ChainID,
    address: string,
  ): SubscriptionTask[] {
    const rows = AccountSubscriptionsRepository.stmtGetByChainAndAddress!.all(
      chainId,
      address,
    ) as { task_data: string }[];

    return rows.map((row) => JSON.parse(row.task_data));
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
      const task = JSON.parse(row.task_data);

      const existing = map.get(key) || [];
      existing.push(task);
      map.set(key, existing);
    }

    return JSON.stringify(Array.from(map.entries()));
  }

  /**
   * Delete a single subscription task for an account.
   */
  static delete(chainId: ChainID, address: string, action: string): void {
    AccountSubscriptionsRepository.stmtDelete!.run(chainId, address, action);
  }

  /**
   * Clear all subscription tasks for an account.
   */
  static clearForAddress(chainId: ChainID, address: string): void {
    AccountSubscriptionsRepository.stmtClearAddress!.run(chainId, address);
  }
}
