// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type {
  AccountNominatingData,
  AccountNominationPoolData,
  AccountSource,
  FlattenedAccountData,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned from the `subscription_accounts` table.
 */
interface SubscriptionAccountRow {
  id: number;
  address: string;
  chain_id: string;
  name: string;
  source: string;
  nomination_pool_data: string | null;
  nominating_data: string | null;
}

/**
 * @name SubscriptionAccountsRepository
 * @summary Data-access layer for the `subscription_accounts` table.
 *
 * Stores unique flattened account data referenced by `account_subscriptions`
 * rows via a foreign key, eliminating duplicate account data per subscription.
 *
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class SubscriptionAccountsRepository {
  private static stmtInsert: BetterSqlite3.Statement | null = null;
  private static stmtUpdate: BetterSqlite3.Statement | null = null;
  private static stmtGetByAddressAndChain: BetterSqlite3.Statement | null =
    null;
  private static stmtGetById: BetterSqlite3.Statement | null = null;
  private static stmtDelete: BetterSqlite3.Statement | null = null;
  private static stmtUpdateName: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    SubscriptionAccountsRepository.stmtInsert = db.prepare(`
      INSERT INTO subscription_accounts
        (address, chain_id, name, source, nomination_pool_data, nominating_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    SubscriptionAccountsRepository.stmtUpdate = db.prepare(`
      UPDATE subscription_accounts
      SET name = ?, source = ?, nomination_pool_data = ?, nominating_data = ?
      WHERE address = ? AND chain_id = ?
    `);

    SubscriptionAccountsRepository.stmtGetByAddressAndChain = db.prepare(
      'SELECT * FROM subscription_accounts WHERE address = ? AND chain_id = ?',
    );

    SubscriptionAccountsRepository.stmtGetById = db.prepare(
      'SELECT * FROM subscription_accounts WHERE id = ?',
    );

    SubscriptionAccountsRepository.stmtDelete = db.prepare(
      'DELETE FROM subscription_accounts WHERE address = ? AND chain_id = ?',
    );

    SubscriptionAccountsRepository.stmtUpdateName = db.prepare(
      'UPDATE subscription_accounts SET name = ? WHERE address = ? AND chain_id = ?',
    );
  }

  /**
   * Insert or update a subscription account. Returns the row id.
   *
   * Uses a SELECT-then-INSERT/UPDATE pattern instead of
   * `INSERT ... ON CONFLICT DO UPDATE` to avoid SQLite's AUTOINCREMENT
   * counter being incremented on the conflict-update path, which would
   * cause new rows to skip id values.
   */
  static upsert(account: FlattenedAccountData): number {
    const poolDataJson = account.nominationPoolData
      ? JSON.stringify(account.nominationPoolData)
      : null;
    const nominatingDataJson = account.nominatingData
      ? JSON.stringify(account.nominatingData)
      : null;

    const existing =
      SubscriptionAccountsRepository.stmtGetByAddressAndChain!.get(
        account.address,
        account.chain,
      ) as SubscriptionAccountRow | undefined;

    if (existing) {
      SubscriptionAccountsRepository.stmtUpdate!.run(
        account.name,
        account.source,
        poolDataJson,
        nominatingDataJson,
        account.address,
        account.chain,
      );
      return existing.id;
    }

    const result = SubscriptionAccountsRepository.stmtInsert!.run(
      account.address,
      account.chain,
      account.name,
      account.source,
      poolDataJson,
      nominatingDataJson,
    );
    return Number(result.lastInsertRowid);
  }

  /**
   * Get a subscription account by address and chain, or null if not found.
   */
  static getByAddressAndChain(
    address: string,
    chainId: ChainID,
  ): FlattenedAccountData | null {
    const row = SubscriptionAccountsRepository.stmtGetByAddressAndChain!.get(
      address,
      chainId,
    ) as SubscriptionAccountRow | undefined;

    return row ? rowToAccount(row) : null;
  }

  /**
   * Get a subscription account by its row id, or null if not found.
   */
  static getById(id: number): FlattenedAccountData | null {
    const row = SubscriptionAccountsRepository.stmtGetById!.get(id) as
      | SubscriptionAccountRow
      | undefined;

    return row ? rowToAccount(row) : null;
  }

  /**
   * Get the row id for an account by address and chain, or null if not found.
   */
  static getIdByAddressAndChain(
    address: string,
    chainId: ChainID,
  ): number | null {
    const row = SubscriptionAccountsRepository.stmtGetByAddressAndChain!.get(
      address,
      chainId,
    ) as SubscriptionAccountRow | undefined;

    return row ? row.id : null;
  }

  /**
   * Delete a subscription account by address and chain.
   */
  static delete(address: string, chainId: ChainID): void {
    SubscriptionAccountsRepository.stmtDelete!.run(address, chainId);
  }

  /**
   * Update the account name for a subscription account.
   */
  static updateName(address: string, chainId: ChainID, newName: string): void {
    SubscriptionAccountsRepository.stmtUpdateName!.run(
      newName,
      address,
      chainId,
    );
  }
}

/**
 * Convert a database row to a FlattenedAccountData object.
 */
function rowToAccount(row: SubscriptionAccountRow): FlattenedAccountData {
  return {
    address: row.address,
    chain: row.chain_id as ChainID,
    name: row.name,
    source: row.source as AccountSource,
    nominationPoolData: row.nomination_pool_data
      ? (JSON.parse(row.nomination_pool_data) as AccountNominationPoolData)
      : null,
    nominatingData: row.nominating_data
      ? (JSON.parse(row.nominating_data) as AccountNominatingData)
      : null,
  };
}
