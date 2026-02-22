// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import { SubscriptionAccountsRepository } from './SubscriptionAccountsRepository';
import type {
  AccountNominatingData,
  AccountNominationPoolData,
  AccountSource,
  FlattenedAccountData,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type {
  SubscriptionTask,
  TaskAction,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned when querying `account_subscriptions`
 * joined with `subscription_accounts`.
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
  account_id: number | null;
  // Joined columns from subscription_accounts (nullable when no match).
  sa_name: string | null;
  sa_source: string | null;
  sa_nomination_pool_data: string | null;
  sa_nominating_data: string | null;
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
 * Account data is stored in the `subscription_accounts` table and linked via
 * a foreign key (`account_id`), eliminating duplicate account blobs.
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

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    AccountSubscriptionsRepository.stmtInsert = db.prepare(`
      INSERT INTO account_subscriptions
        (chain_id, address, action, api_call_as_string, category, enable_os_notifications, help_key, label, status, action_args, account_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    AccountSubscriptionsRepository.stmtUpdate = db.prepare(`
      UPDATE account_subscriptions
      SET api_call_as_string = ?, category = ?, enable_os_notifications = ?,
          help_key = ?, label = ?, status = ?, action_args = ?, account_id = ?
      WHERE chain_id = ? AND address = ? AND action = ?
    `);

    AccountSubscriptionsRepository.stmtDelete = db.prepare(
      'DELETE FROM account_subscriptions WHERE chain_id = ? AND address = ? AND action = ?',
    );

    AccountSubscriptionsRepository.stmtGetByChainAddressAction = db.prepare(
      'SELECT id FROM account_subscriptions WHERE chain_id = ? AND address = ? AND action = ?',
    );

    AccountSubscriptionsRepository.stmtGetByChainAndAddress = db.prepare(`
      SELECT
        asub.*,
        sa.name AS sa_name,
        sa.source AS sa_source,
        sa.nomination_pool_data AS sa_nomination_pool_data,
        sa.nominating_data AS sa_nominating_data
      FROM account_subscriptions asub
      LEFT JOIN subscription_accounts sa ON sa.id = asub.account_id
      WHERE asub.chain_id = ? AND asub.address = ?
      ORDER BY asub.action
    `);

    AccountSubscriptionsRepository.stmtGetAll = db.prepare(`
      SELECT
        asub.*,
        sa.name AS sa_name,
        sa.source AS sa_source,
        sa.nomination_pool_data AS sa_nomination_pool_data,
        sa.nominating_data AS sa_nominating_data
      FROM account_subscriptions asub
      LEFT JOIN subscription_accounts sa ON sa.id = asub.account_id
      ORDER BY asub.chain_id, asub.address, asub.action
    `);

    AccountSubscriptionsRepository.stmtClearAddress = db.prepare(
      'DELETE FROM account_subscriptions WHERE chain_id = ? AND address = ?',
    );
  }

  /**
   * Insert or update a subscription task for an account.
   *
   * If the task carries account data, the account is upserted into the
   * `subscription_accounts` table first and the resulting id is stored as
   * `account_id` on the subscription row.
   *
   * Uses SELECT-then-INSERT/UPDATE so that existing rows keep their id
   * (SQLite's `INSERT OR REPLACE` would DELETE + INSERT, changing the id).
   */
  static set(params: Readonly<SetSubscriptionParams>): void {
    const { chainId, address, action, task } = params;

    // Upsert account data into the normalized table when present.
    let accountId: number | null = null;
    if (task.account) {
      accountId = SubscriptionAccountsRepository.upsert(task.account);
    }

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
        accountId,
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
        accountId,
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

    return JSON.stringify(Array.from(map.entries()));
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
}

/**
 * Convert a joined database row to a SubscriptionTask object.
 * Account data is reconstructed from the joined `subscription_accounts` columns.
 */
function rowToTask(row: AccountSubscriptionRow): SubscriptionTask {
  let account: FlattenedAccountData | undefined;

  if (row.account_id !== null && row.sa_name !== null) {
    account = {
      address: row.address,
      chain: row.chain_id as ChainID,
      name: row.sa_name,
      source: row.sa_source as AccountSource,
      nominationPoolData: row.sa_nomination_pool_data
        ? (JSON.parse(row.sa_nomination_pool_data) as AccountNominationPoolData)
        : null,
      nominatingData: row.sa_nominating_data
        ? (JSON.parse(row.sa_nominating_data) as AccountNominatingData)
        : null,
    };
  }

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
    account,
  };
}
