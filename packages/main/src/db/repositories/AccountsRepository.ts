// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type {
  AccountSource,
  StoredAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned from the `imported_accounts` table.
 */
interface ImportedAccountRow {
  address: string;
  chain_id: string;
  name: string;
  source: string;
}

/**
 * @name AccountsRepository
 * @summary Data-access layer for the `imported_accounts` table.
 *
 * Provides typed CRUD operations using prepared statements for performance.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class AccountsRepository {
  private static stmtGetAll: BetterSqlite3.Statement | null = null;
  private static stmtUpsert: BetterSqlite3.Statement | null = null;
  private static stmtDelete: BetterSqlite3.Statement | null = null;
  private static stmtDeleteAll: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    AccountsRepository.stmtGetAll = db.prepare(
      'SELECT * FROM imported_accounts',
    );
    AccountsRepository.stmtUpsert = db.prepare(`
      INSERT OR REPLACE INTO imported_accounts
        (address, chain_id, name, source)
      VALUES (?, ?, ?, ?)
    `);
    AccountsRepository.stmtDelete = db.prepare(
      'DELETE FROM imported_accounts WHERE address = ? AND chain_id = ?',
    );
    AccountsRepository.stmtDeleteAll = db.prepare(
      'DELETE FROM imported_accounts',
    );
  }

  /**
   * Get all imported accounts as a serialized map structure.
   *
   * Returns `[ChainID, StoredAccount[]][]`
   */
  static getAll(): string {
    const rows = AccountsRepository.stmtGetAll!.all() as ImportedAccountRow[];
    const map = new Map<ChainID, StoredAccount[]>();

    for (const row of rows) {
      const chainId = row.chain_id as ChainID;
      const account: StoredAccount = {
        _address: row.address,
        _chain: chainId,
        _name: row.name,
        _source: row.source as AccountSource,
      };

      const existing = map.get(chainId) || [];
      existing.push(account);
      map.set(chainId, existing);
    }

    return JSON.stringify(Array.from(map.entries()));
  }

  /**
   * Replace all imported accounts with the provided data.
   *
   * Accepts the serialized `[ChainID, StoredAccount[]][]` format used by
   * the renderer, clears the table, and inserts all rows in a transaction.
   */
  static replaceAll(serialized: string): void {
    const entries: [ChainID, StoredAccount[]][] = JSON.parse(serialized);
    const db = DatabaseManager.getDb();

    db.transaction(() => {
      AccountsRepository.stmtDeleteAll!.run();
      for (const [, accounts] of entries) {
        for (const account of accounts) {
          AccountsRepository.stmtUpsert!.run(
            account._address,
            account._chain,
            account._name,
            account._source,
          );
        }
      }
    })();
  }

  /**
   * Delete a single imported account by address and chain.
   */
  static delete(address: string, chainId: ChainID): void {
    AccountsRepository.stmtDelete!.run(address, chainId);
  }
}
