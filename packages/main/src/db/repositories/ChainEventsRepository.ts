// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type {
  ChainEventSubscription,
  EventSubKind,
  HelpItemKey,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned from the `chain_event_subscriptions` table.
 */
interface ChainEventRow {
  id: string;
  chain_id: string;
  kind: string;
  pallet: string;
  event_name: string;
  enabled: number;
  os_notify: number;
  label: string;
  event_data: string | null;
  help_key: string | null;
  scope_type: string;
  scope_id: string | null;
}

/**
 * Row shape from the `chain_event_active_refs` table.
 */
interface ActiveRefRow {
  chain_id: string;
  ref_id: number;
}

/**
 * @name ChainEventsRepository
 * @summary Data-access layer for chain event persistence tables.
 *
 * Manages both `chain_event_subscriptions` and `chain_event_active_refs` tables.
 * Uses prepared statements for performance. Must be initialized after `DatabaseManager.initialize()`.
 */
export class ChainEventsRepository {
  // chain_event_subscriptions statements
  private static stmtInsert: BetterSqlite3.Statement | null = null;
  private static stmtGetAll: BetterSqlite3.Statement | null = null;
  private static stmtGetGlobal: BetterSqlite3.Statement | null = null;
  private static stmtGetByAccount: BetterSqlite3.Statement | null = null;
  private static stmtGetByRef: BetterSqlite3.Statement | null = null;
  private static stmtDeleteByAccountAndId: BetterSqlite3.Statement | null =
    null;
  private static stmtDeleteAllByAccount: BetterSqlite3.Statement | null = null;
  private static stmtDeleteAllByRef: BetterSqlite3.Statement | null = null;
  private static stmtDeleteByChainIdAndPalletEvent: BetterSqlite3.Statement | null =
    null;

  // chain_event_active_refs statements
  private static stmtInsertActiveRef: BetterSqlite3.Statement | null = null;
  private static stmtGetAllActiveRefs: BetterSqlite3.Statement | null = null;
  private static stmtDeleteActiveRef: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    // ============================================
    // chain_event_subscriptions statements
    // ============================================

    ChainEventsRepository.stmtInsert = db.prepare(`
      INSERT OR REPLACE INTO chain_event_subscriptions
        (id, chain_id, kind, pallet, event_name, enabled, os_notify, label, event_data, help_key, scope_type, scope_id)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    ChainEventsRepository.stmtGetAll = db.prepare(`
      SELECT * FROM chain_event_subscriptions
      ORDER BY chain_id, scope_type, scope_id
    `);

    ChainEventsRepository.stmtGetGlobal = db.prepare(`
      SELECT * FROM chain_event_subscriptions
      WHERE scope_type = 'global'
      ORDER BY chain_id
    `);

    ChainEventsRepository.stmtGetByAccount = db.prepare(`
      SELECT * FROM chain_event_subscriptions
      WHERE chain_id = ? AND scope_type = 'account' AND scope_id = ?
      ORDER BY pallet, event_name
    `);

    ChainEventsRepository.stmtGetByRef = db.prepare(`
      SELECT * FROM chain_event_subscriptions
      WHERE chain_id = ? AND scope_type = 'ref' AND scope_id = ?
      ORDER BY pallet, event_name
    `);

    ChainEventsRepository.stmtDeleteByAccountAndId = db.prepare(`
      DELETE FROM chain_event_subscriptions
      WHERE chain_id = ? AND scope_id = ? AND scope_type = 'account' AND pallet = ? AND event_name = ?
    `);

    ChainEventsRepository.stmtDeleteAllByAccount = db.prepare(`
      DELETE FROM chain_event_subscriptions
      WHERE chain_id = ? AND scope_id = ? AND scope_type = 'account'
    `);

    ChainEventsRepository.stmtDeleteAllByRef = db.prepare(`
      DELETE FROM chain_event_subscriptions
      WHERE chain_id = ? AND scope_id = ? AND scope_type = 'ref'
    `);

    ChainEventsRepository.stmtDeleteByChainIdAndPalletEvent = db.prepare(`
      DELETE FROM chain_event_subscriptions
      WHERE chain_id = ? AND scope_type = 'global' AND pallet = ? AND event_name = ?
    `);

    // ============================================
    // chain_event_active_refs statements
    // ============================================

    ChainEventsRepository.stmtInsertActiveRef = db.prepare(`
      INSERT OR IGNORE INTO chain_event_active_refs (chain_id, ref_id)
      VALUES (?, ?)
    `);

    ChainEventsRepository.stmtGetAllActiveRefs = db.prepare(`
      SELECT chain_id, ref_id FROM chain_event_active_refs
      ORDER BY chain_id, ref_id
    `);

    ChainEventsRepository.stmtDeleteActiveRef = db.prepare(
      'DELETE FROM chain_event_active_refs WHERE chain_id = ? AND ref_id = ?',
    );
  }

  /**
   * Convert a database row to a ChainEventSubscription object.
   */
  private static rowToSubscription(row: ChainEventRow): ChainEventSubscription {
    return {
      id: row.id,
      chainId: row.chain_id as ChainID,
      kind: row.kind as EventSubKind,
      pallet: row.pallet,
      eventName: row.event_name,
      enabled: row.enabled === 1,
      osNotify: row.os_notify === 1,
      label: row.label,
      eventData: row.event_data ? JSON.parse(row.event_data) : undefined,
      helpKey: row.help_key ? (row.help_key as HelpItemKey) : undefined,
    };
  }

  /**
   * Insert or replace a chain event subscription.
   */
  static insert(
    sub: ChainEventSubscription,
    scopeType: string,
    scopeId: string | null,
  ): void {
    const eventDataStr = sub.eventData ? JSON.stringify(sub.eventData) : null;
    const helpKey = sub.helpKey ?? null;

    ChainEventsRepository.stmtInsert!.run(
      sub.id,
      sub.chainId,
      sub.kind,
      sub.pallet,
      sub.eventName,
      sub.enabled ? 1 : 0,
      sub.osNotify ? 1 : 0,
      sub.label,
      eventDataStr,
      helpKey,
      scopeType,
      scopeId,
    );
  }

  /**
   * Get all global chain event subscriptions for a chain, grouped by chainId.
   */
  static getAllGlobal(): Map<ChainID, ChainEventSubscription[]> {
    const rows = ChainEventsRepository.stmtGetGlobal!.all() as ChainEventRow[];
    const map = new Map<ChainID, ChainEventSubscription[]>();

    for (const row of rows) {
      const chainId = row.chain_id as ChainID;
      const sub = ChainEventsRepository.rowToSubscription(row);

      if (!map.has(chainId)) {
        map.set(chainId, []);
      }
      map.get(chainId)!.push(sub);
    }

    return map;
  }

  /**
   * Get all global chain event subscriptions as serialized Map<ChainID, ChainEventSubscription[]>.
   * Used for IPC to renderer.
   */
  static getAllGlobalSerialized(): string {
    const map = ChainEventsRepository.getAllGlobal();
    return JSON.stringify([...map]);
  }

  /**
   * Get all chain event subscriptions for a specific account (address + chain).
   */
  static getAllForAccount(
    chainId: ChainID,
    address: string,
  ): ChainEventSubscription[] {
    const rows = ChainEventsRepository.stmtGetByAccount!.all(
      chainId,
      address,
    ) as ChainEventRow[];
    return rows.map((row) => ChainEventsRepository.rowToSubscription(row));
  }

  /**
   * Get all chain event subscriptions for a specific account, serialized.
   */
  static getAllForAccountSerialized(chainId: ChainID, address: string): string {
    const subs = ChainEventsRepository.getAllForAccount(chainId, address);
    return JSON.stringify(subs);
  }

  /**
   * Get all chain event subscriptions for a specific ref (in a chain).
   */
  static getAllForRef(
    chainId: ChainID,
    refId: number,
  ): ChainEventSubscription[] {
    const rows = ChainEventsRepository.stmtGetByRef!.all(
      chainId,
      refId.toString(),
    ) as ChainEventRow[];
    return rows.map((row) => ChainEventsRepository.rowToSubscription(row));
  }

  /**
   * Get all chain event subscriptions for a specific chain, across all scopes.
   */
  static getAllForChain(chainId: ChainID): ChainEventSubscription[] {
    const rows = (
      ChainEventsRepository.stmtGetAll!.all() as ChainEventRow[]
    ).filter((row) => row.chain_id === chainId);
    return rows.map((row) => ChainEventsRepository.rowToSubscription(row));
  }

  /**
   * Remove a global chain event subscription (by pallet + eventName).
   */
  static removeGlobal(
    chainId: ChainID,
    pallet: string,
    eventName: string,
  ): void {
    ChainEventsRepository.stmtDeleteByChainIdAndPalletEvent!.run(
      chainId,
      pallet,
      eventName,
    );
  }

  /**
   * Remove an account-scoped chain event subscription.
   */
  static removeForAccount(
    chainId: ChainID,
    address: string,
    pallet: string,
    eventName: string,
  ): void {
    ChainEventsRepository.stmtDeleteByAccountAndId!.run(
      chainId,
      address,
      pallet,
      eventName,
    );
  }

  /**
   * Remove all account-scoped chain event subscriptions for an account.
   */
  static removeAllForAccount(chainId: ChainID, address: string): void {
    ChainEventsRepository.stmtDeleteAllByAccount!.run(chainId, address);
  }

  /**
   * Remove a ref-scoped chain event subscription.
   */
  static removeForRef(
    chainId: ChainID,
    refId: number,
    pallet: string,
    eventName: string,
  ): void {
    ChainEventsRepository.stmtDeleteByAccountAndId!.run(
      chainId,
      refId.toString(),
      pallet,
      eventName,
    );
  }

  /**
   * Remove all ref-scoped chain event subscriptions for a ref.
   */
  static removeAllForRef(chainId: ChainID, refId: number): void {
    ChainEventsRepository.stmtDeleteAllByRef!.run(chainId, refId.toString());
  }

  // ============================================
  // Active Refs Management
  // ============================================

  /**
   * Add a ref ID to the active refs cache.
   */
  static addActiveRef(chainId: ChainID, refId: number): void {
    ChainEventsRepository.stmtInsertActiveRef!.run(chainId, refId);
  }

  /**
   * Get all active ref keys as array of strings (format: "chainId::refId").
   */
  static getActiveRefs(): string[] {
    const rows =
      ChainEventsRepository.stmtGetAllActiveRefs!.all() as ActiveRefRow[];
    return rows.map((row) => `${row.chain_id}::${row.ref_id}`);
  }

  /**
   * Remove a ref ID from the active refs cache.
   */
  static removeActiveRef(chainId: ChainID, refId: number): void {
    ChainEventsRepository.stmtDeleteActiveRef!.run(chainId, refId);
  }
}
