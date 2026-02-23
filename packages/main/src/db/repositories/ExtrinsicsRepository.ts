// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type { ExtrinsicInfo, TxStatus } from '@polkadot-live/types/tx';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned from the `extrinsics` table.
 */
interface ExtrinsicRow {
  tx_id: string;
  action_meta: string;
  estimated_fee: string | null;
  tx_status: string;
  timestamp: number;
}

/**
 * @name ExtrinsicsRepository
 * @summary Data-access layer for the `extrinsics` table.
 *
 * Provides typed CRUD operations using prepared statements for performance.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class ExtrinsicsRepository {
  private static stmtGetAll: BetterSqlite3.Statement | null = null;
  private static stmtInsert: BetterSqlite3.Statement | null = null;
  private static stmtDelete: BetterSqlite3.Statement | null = null;
  private static stmtUpdate: BetterSqlite3.Statement | null = null;
  private static stmtDeleteAll: BetterSqlite3.Statement | null = null;
  private static stmtCountByStatus: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    ExtrinsicsRepository.stmtGetAll = db.prepare(`
      SELECT
        tx_id,
        action_meta,
        estimated_fee,
        tx_status,
        timestamp
      FROM extrinsics
      ORDER BY timestamp DESC
    `);

    ExtrinsicsRepository.stmtInsert = db.prepare(`
      INSERT INTO extrinsics
        (tx_id, action_meta, estimated_fee, tx_status, timestamp)
      VALUES
        (?, ?, ?, ?, ?)
    `);

    ExtrinsicsRepository.stmtDelete = db.prepare(
      'DELETE FROM extrinsics WHERE tx_id = ?',
    );

    ExtrinsicsRepository.stmtUpdate = db.prepare(`
      UPDATE extrinsics
      SET tx_status = ?, estimated_fee = ?
      WHERE tx_id = ?
    `);

    ExtrinsicsRepository.stmtDeleteAll = db.prepare('DELETE FROM extrinsics');

    ExtrinsicsRepository.stmtCountByStatus = db.prepare(
      'SELECT COUNT(*) as count FROM extrinsics WHERE tx_status = ?',
    );
  }

  /**
   * Get all stored extrinsics.
   */
  static getAll(): ExtrinsicInfo[] {
    const rows = ExtrinsicsRepository.stmtGetAll!.all() as ExtrinsicRow[];
    return rows.map(ExtrinsicsRepository.rowToExtrinsic);
  }

  /**
   * Insert a single extrinsic.
   */
  static insert(extrinsic: ExtrinsicInfo): void {
    ExtrinsicsRepository.stmtInsert!.run(
      extrinsic.txId,
      JSON.stringify(extrinsic.actionMeta),
      extrinsic.estimatedFee ?? null,
      extrinsic.txStatus,
      extrinsic.timestamp,
    );
  }

  /**
   * Insert multiple extrinsics in a single transaction.
   */
  static insertMany(extrinsics: ExtrinsicInfo[]): void {
    const db = DatabaseManager.getDb();
    db.transaction(() => {
      for (const extrinsic of extrinsics) {
        ExtrinsicsRepository.insert(extrinsic);
      }
    })();
  }

  /**
   * Delete an extrinsic by its tx ID.
   */
  static delete(txId: string): void {
    ExtrinsicsRepository.stmtDelete!.run(txId);
  }

  /**
   * Update an extrinsic's status and/or fee.
   */
  static update(txId: string, txStatus: TxStatus, estimatedFee?: string): void {
    ExtrinsicsRepository.stmtUpdate!.run(txStatus, estimatedFee ?? null, txId);
  }

  /**
   * Clear all extrinsics from the table.
   */
  static clear(): void {
    ExtrinsicsRepository.stmtDeleteAll!.run();
  }

  /**
   * Replace all extrinsics (delete all and insert new ones).
   */
  static replaceAll(extrinsics: ExtrinsicInfo[]): void {
    const db = DatabaseManager.getDb();
    db.transaction(() => {
      ExtrinsicsRepository.clear();
      ExtrinsicsRepository.insertMany(extrinsics);
    })();
  }

  /**
   * Get count of extrinsics, optionally filtered by status.
   */
  static count(status?: TxStatus): number {
    if (!status) {
      const all = ExtrinsicsRepository.getAll();
      return all.length;
    }
    const result = ExtrinsicsRepository.stmtCountByStatus!.get(status) as {
      count: number;
    };
    return result.count;
  }

  /**
   * Convert a database row into an `ExtrinsicInfo`.
   */
  private static rowToExtrinsic(row: ExtrinsicRow): ExtrinsicInfo {
    return {
      txId: row.tx_id,
      actionMeta: JSON.parse(row.action_meta),
      estimatedFee: row.estimated_fee ?? undefined,
      txStatus: row.tx_status as TxStatus,
      timestamp: row.timestamp,
      dynamicInfo: undefined,
    };
  }
}
