// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DatabaseManager } from '../Database';
import type {
  EventCallback,
  EventCategory,
} from '@polkadot-live/types/reporter';
import type { TaskAction } from '@polkadot-live/types/subscriptions';
import type BetterSqlite3 from 'better-sqlite3';

/**
 * Row shape returned from the `events` table.
 */
interface EventRow {
  uid: string;
  category: string;
  task_action: string;
  who_origin: string;
  who_data: string;
  title: string;
  subtitle: string;
  data: string | null;
  timestamp: number;
  tx_actions: string | null;
  uri_actions: string | null;
  stale: number;
  encoded_info: string | null;
}

/**
 * @name EventsRepository
 * @summary Data-access layer for the `events` table.
 *
 * Provides typed CRUD operations using prepared statements for performance.
 * Must be initialized after `DatabaseManager.initialize()`.
 */
export class EventsRepository {
  private static stmtGetAll: BetterSqlite3.Statement | null = null;
  private static stmtInsert: BetterSqlite3.Statement | null = null;
  private static stmtDelete: BetterSqlite3.Statement | null = null;
  private static stmtDeleteByCategory: BetterSqlite3.Statement | null = null;
  private static stmtUpdate: BetterSqlite3.Statement | null = null;
  private static stmtUpdateWhoData: BetterSqlite3.Statement | null = null;

  /**
   * Prepare and cache SQL statements. Call once after the database is ready.
   */
  static initialize(): void {
    const db = DatabaseManager.getDb();

    EventsRepository.stmtGetAll = db.prepare(`
      SELECT
        uid,
        category,
        task_action,
        who_origin,
        who_data,
        title,
        subtitle,
        data,
        timestamp,
        tx_actions,
        uri_actions,
        stale,
        encoded_info
      FROM events
      ORDER BY timestamp DESC
    `);

    EventsRepository.stmtInsert = db.prepare(`
      INSERT INTO events
        (uid, category, task_action, who_origin, who_data, title, subtitle, data, timestamp, tx_actions, uri_actions, stale, encoded_info)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    EventsRepository.stmtDelete = db.prepare(
      'DELETE FROM events WHERE uid = ?',
    );

    EventsRepository.stmtDeleteByCategory = db.prepare(
      'DELETE FROM events WHERE category = ?',
    );

    EventsRepository.stmtUpdate = db.prepare(`
      UPDATE events
      SET stale = ?
      WHERE uid = ?
    `);

    EventsRepository.stmtUpdateWhoData = db.prepare(`
      UPDATE events
      SET who_data = ?
      WHERE uid = ?
    `);
  }

  /**
   * Get all stored events.
   */
  static getAll(): EventCallback[] {
    const rows = EventsRepository.stmtGetAll!.all() as EventRow[];
    return rows.map(EventsRepository.rowToEvent);
  }

  /**
   * Insert a single event.
   */
  static insert(event: EventCallback): void {
    EventsRepository.stmtInsert!.run(
      event.uid,
      event.category,
      event.taskAction,
      event.who.origin,
      JSON.stringify(event.who.data),
      event.title,
      event.subtitle,
      event.data ? JSON.stringify(event.data) : null,
      event.timestamp,
      event.txActions.length > 0 ? JSON.stringify(event.txActions) : null,
      event.uriActions.length > 0 ? JSON.stringify(event.uriActions) : null,
      event.stale ? 1 : 0,
      event.encodedInfo ? JSON.stringify(event.encodedInfo) : null,
    );
  }

  /**
   * Insert multiple events in a single transaction.
   */
  static insertMany(events: EventCallback[]): void {
    const db = DatabaseManager.getDb();
    db.transaction(() => {
      for (const event of events) {
        EventsRepository.insert(event);
      }
    })();
  }

  /**
   * Delete an event by its UID.
   */
  static delete(uid: string): void {
    EventsRepository.stmtDelete!.run(uid);
  }

  /**
   * Delete multiple events by their UIDs in a single transaction.
   */
  static deleteMany(uids: string[]): void {
    const db = DatabaseManager.getDb();
    db.transaction(() => {
      for (const uid of uids) {
        EventsRepository.delete(uid);
      }
    })();
  }

  /**
   * Delete all events in a given category.
   */
  static deleteByCategory(category: EventCategory): void {
    EventsRepository.stmtDeleteByCategory!.run(category);
  }

  /**
   * Update event stale status.
   */
  static markStale(uid: string): void {
    EventsRepository.stmtUpdate!.run(1, uid);
  }

  /**
   * Update event who_data for specific UIDs in a single transaction.
   */
  static updateWhoDataMany(
    updates: Array<{ uid: string; whoData: unknown }>,
  ): void {
    const db = DatabaseManager.getDb();
    db.transaction(() => {
      for (const { uid, whoData } of updates) {
        EventsRepository.stmtUpdateWhoData!.run(JSON.stringify(whoData), uid);
      }
    })();
  }

  /**
   * Convert a database row into an `EventCallback`.
   */
  private static rowToEvent(row: EventRow): EventCallback {
    return {
      uid: row.uid,
      category: row.category as EventCategory,
      taskAction: row.task_action as TaskAction | string,
      who: {
        origin: row.who_origin as
          | 'account'
          | 'chain'
          | 'chainEvent'
          | 'interval',
        data: JSON.parse(row.who_data),
      },
      title: row.title,
      subtitle: row.subtitle,
      data: row.data ? JSON.parse(row.data) : null,
      timestamp: row.timestamp,
      txActions: row.tx_actions ? JSON.parse(row.tx_actions) : [],
      uriActions: row.uri_actions ? JSON.parse(row.uri_actions) : [],
      stale: row.stale === 1,
      encodedInfo: row.encoded_info ? JSON.parse(row.encoded_info) : undefined,
    };
  }
}
