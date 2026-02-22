// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned from the `raw_addresses` table.
 */
interface RawAddressRow {
  public_key_hex: string;
  account_name: string;
  source: string;
  encoded_accounts: string;
}

/**
 * @name AddressesRepository
 * @summary Data-access layer for the `raw_addresses` table.
 *
 * Provides typed CRUD operations using prepared statements for performance.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class AddressesRepository {
  private static stmtGetBySource: BetterSqlite3.Statement | null = null;
  private static stmtGetByKey: BetterSqlite3.Statement | null = null;
  private static stmtUpsert: BetterSqlite3.Statement | null = null;
  private static stmtDelete: BetterSqlite3.Statement | null = null;
  private static stmtExists: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    AddressesRepository.stmtGetBySource = db.prepare(
      'SELECT * FROM raw_addresses WHERE source = ?',
    );
    AddressesRepository.stmtGetByKey = db.prepare(
      'SELECT * FROM raw_addresses WHERE public_key_hex = ?',
    );
    AddressesRepository.stmtUpsert = db.prepare(`
      INSERT OR REPLACE INTO raw_addresses
        (public_key_hex, account_name, source, encoded_accounts)
      VALUES (?, ?, ?, ?)
    `);
    AddressesRepository.stmtDelete = db.prepare(
      'DELETE FROM raw_addresses WHERE public_key_hex = ?',
    );
    AddressesRepository.stmtExists = db.prepare(
      'SELECT 1 FROM raw_addresses WHERE public_key_hex = ?',
    );
  }

  /**
   * Get all addresses for a given account source.
   */
  static getBySource(source: AccountSource): ImportedGenericAccount[] {
    const rows = AddressesRepository.stmtGetBySource!.all(
      source,
    ) as RawAddressRow[];
    return rows.map(AddressesRepository.rowToAccount);
  }

  /**
   * Get a single address by its public key hex.
   */
  static getByKey(publicKeyHex: string): ImportedGenericAccount | undefined {
    const row = AddressesRepository.stmtGetByKey!.get(publicKeyHex) as
      | RawAddressRow
      | undefined;
    return row ? AddressesRepository.rowToAccount(row) : undefined;
  }

  /**
   * Insert or update an address.
   */
  static upsert(account: ImportedGenericAccount): void {
    AddressesRepository.stmtUpsert!.run(
      account.publicKeyHex,
      account.accountName,
      account.source,
      JSON.stringify(account.encodedAccounts),
    );
  }

  /**
   * Delete an address by its public key hex.
   */
  static delete(publicKeyHex: string): void {
    AddressesRepository.stmtDelete!.run(publicKeyHex);
  }

  /**
   * Check if an address exists by its public key hex.
   */
  static exists(publicKeyHex: string): boolean {
    return AddressesRepository.stmtExists!.get(publicKeyHex) !== undefined;
  }

  /**
   * Convert a database row into an `ImportedGenericAccount`.
   */
  private static rowToAccount(row: RawAddressRow): ImportedGenericAccount {
    return {
      publicKeyHex: row.public_key_hex,
      accountName: row.account_name,
      source: row.source as AccountSource,
      encodedAccounts: JSON.parse(row.encoded_accounts),
    };
  }
}
