// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
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
