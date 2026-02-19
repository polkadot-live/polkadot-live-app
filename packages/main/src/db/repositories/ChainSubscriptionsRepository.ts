// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';
import type BetterSqlite3 from 'better-sqlite3';

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
  private static stmtGetByChain: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    ChainSubscriptionsRepository.stmtInsert = db.prepare(`
      INSERT OR REPLACE INTO chain_subscriptions
        (chain_id, action, task_data)
      VALUES (?, ?, ?)
    `);

    ChainSubscriptionsRepository.stmtDelete = db.prepare(
      'DELETE FROM chain_subscriptions WHERE chain_id = ? AND action = ?',
    );

    ChainSubscriptionsRepository.stmtGetAll = db.prepare(
      'SELECT task_data FROM chain_subscriptions ORDER BY chain_id, action',
    );

    ChainSubscriptionsRepository.stmtGetByChain = db.prepare(
      'SELECT task_data FROM chain_subscriptions WHERE chain_id = ? ORDER BY action',
    );
  }

  /**
   * Insert or replace a chain subscription task.
   */
  static set(chainId: ChainID, action: string, task: SubscriptionTask): void {
    const taskJson = JSON.stringify(task);
    ChainSubscriptionsRepository.stmtInsert!.run(chainId, action, taskJson);
  }

  /**
   * Get all chain subscription tasks as serialized JSON array.
   * Returns '[]' if no tasks exist.
   */
  static getAll(): string {
    const rows = ChainSubscriptionsRepository.stmtGetAll!.all() as {
      task_data: string;
    }[];

    if (rows.length === 0) {
      return '[]';
    }

    const tasks = rows.map((row) => JSON.parse(row.task_data));
    return JSON.stringify(tasks);
  }

  /**
   * Get all chain subscription tasks as deserialized objects.
   */
  static getAllDeserialized(): SubscriptionTask[] {
    const rows = ChainSubscriptionsRepository.stmtGetAll!.all() as {
      task_data: string;
    }[];

    return rows.map((row) => JSON.parse(row.task_data));
  }

  /**
   * Get all subscription tasks for a specific chain as deserialized objects.
   */
  static getByChainDeserialized(chainId: ChainID): SubscriptionTask[] {
    const rows = ChainSubscriptionsRepository.stmtGetByChain!.all(chainId) as {
      task_data: string;
    }[];

    return rows.map((row) => JSON.parse(row.task_data));
  }

  /**
   * Delete a single chain subscription task.
   */
  static delete(chainId: ChainID, action: string): void {
    ChainSubscriptionsRepository.stmtDelete!.run(chainId, action);
  }
}
