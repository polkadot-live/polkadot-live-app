// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigMain } from '@/config/main';
import { store } from '@/main';
import type { AnyData } from '@polkadot-live/types/misc';
import type { IpcTask } from '@polkadot-live/types/communication';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';

export class AddressesController {
  /**
   * @name process
   * @summary Process an address IPC task.
   */
  static process(task: IpcTask): string | void {
    switch (task.action) {
      case 'raw-account:add': {
        this.add(task);
        break;
      }
      case 'raw-account:delete': {
        this.delete(task);
        break;
      }
      case 'raw-account:get': {
        return this.get(task);
      }
      case 'raw-account:getAll': {
        return this.getAll();
      }
      case 'raw-account:persist': {
        this.persist(task);
        break;
      }
      case 'raw-account:import': {
        this.doImport(task);
        break;
      }
      case 'raw-account:remove': {
        this.remove(task);
        break;
      }
      case 'raw-account:rename': {
        this.rename(task);
        break;
      }
    }
  }

  /**
   * @name getAll
   * @summary Get all stored addresses and serialize as map.
   */
  static getAll(): string {
    const sources: AccountSource[] = [
      'vault',
      'ledger',
      'read-only',
      'wallet-connect',
    ];

    const map = new Map<AccountSource, string>();
    for (const source of sources) {
      const key = ConfigMain.getStorageKey(source);
      const addresses = store.has(key) ? this.getFromStore(key) : '[]';
      map.set(source, addresses);
    }

    return JSON.stringify(Array.from(map.entries()));
  }

  /**
   * @name add
   * @summary Set the import flag of an address to `true`.
   */
  private static add(task: IpcTask) {
    const { address, source, name } = task.data;
    const key = ConfigMain.getStorageKey(source);

    if (source === 'ledger') {
      // Update ledger address.
      const stored = this.getStoredAddresses(key, true) as LedgerLocalAddress[];
      const serialized = JSON.stringify(
        stored.map((a) =>
          a.address === address ? { ...a, name, isImported: true } : a
        )
      );

      this.setInStore(key, serialized);
    } else {
      // Update stored vault or read-only accounts.
      const stored = this.getStoredAddresses(key) as LocalAddress[];
      const serialized = JSON.stringify(
        stored.map((a) =>
          a.address === address ? { ...a, name, isImported: true } : a
        )
      );

      this.setInStore(key, serialized);
    }
  }

  /**
   * @name delete
   * @summary Delete a received address' data from store.
   */
  private static delete(task: IpcTask) {
    const { source, address } = task.data;
    const key = ConfigMain.getStorageKey(source);

    if (source === 'ledger') {
      // Update stored ledger accounts.
      const stored = this.getStoredAddresses(key, true) as LedgerLocalAddress[];
      const serialized = JSON.stringify(
        stored.filter((a) => a.address !== address)
      );

      this.setInStore(key, serialized);
    } else {
      // Update stored vault or read-only accounts.
      const stored = this.getStoredAddresses(key) as LocalAddress[];
      const serialized = JSON.stringify(
        stored.filter((a) => a.address !== address)
      );

      this.setInStore(key, serialized);
    }
  }

  /**
   * @name getBackupData
   * @summary Get all stored addresses in serialized form.
   */
  static getBackupData(): string {
    const map = new Map<AccountSource, string>();

    for (const source of [
      'ledger',
      'read-only',
      'vault',
      'wallet-connect',
    ] as AccountSource[]) {
      const key = ConfigMain.getStorageKey(source);
      const fetched =
        source === 'ledger'
          ? (this.getStoredAddresses(key) as LedgerLocalAddress[])
          : (this.getStoredAddresses(key) as LocalAddress[]);

      if (fetched.length === 0) {
        continue;
      }

      map.set(source, JSON.stringify(fetched));
    }

    return JSON.stringify(Array.from(map.entries()));
  }

  /**
   * @name getAllBySource
   * @summary Get all addresses from a particular source.
   */
  static getAllBySource(
    source: AccountSource
  ): LedgerLocalAddress[] | LocalAddress[] {
    const key = ConfigMain.getStorageKey(source);
    return this.getStoredAddresses(key, source === 'ledger');
  }

  /**
   * @name get
   * @summary Get all stored addresses for an account type.
   */
  private static get(task: IpcTask): string {
    const { source } = task.data;
    const key = ConfigMain.getStorageKey(source);
    return store.has(key) ? this.getFromStore(key) : '[]';
  }

  /**
   * @name doImport
   * @summary Persist an address to store that's being imported from a backup file.
   */
  private static doImport(task: IpcTask) {
    const { source, serialized } = task.data;
    const parsed: LocalAddress | LedgerLocalAddress = JSON.parse(serialized);
    const { address, isImported, name } = parsed;

    if (this.isAlreadyPersisted(address)) {
      isImported
        ? this.add({
            action: 'raw-account:add',
            data: { source, address, name },
          })
        : this.remove({
            action: 'raw-account:remove',
            data: { source, address, name },
          });
    } else {
      this.persist({
        action: 'raw-account:persist',
        data: { source, serialized },
      });
    }
  }

  /**
   * @name persist
   * @summary Persist received address data to store.
   */
  private static persist(task: IpcTask) {
    try {
      const { source, serialized } = task.data;
      const key = ConfigMain.getStorageKey(source);

      if (source === 'ledger') {
        // Persist ledger account.
        const parsed: LedgerLocalAddress = JSON.parse(serialized);
        const stored = this.getStoredAddresses(
          key,
          true
        ) as LedgerLocalAddress[];

        !this.isAlreadyPersisted(parsed.address) &&
          this.setInStore(key, JSON.stringify([...stored, parsed]));
      } else {
        // Persist vault or read-only account.
        const parsed: LocalAddress = JSON.parse(serialized);
        const stored = this.getStoredAddresses(key) as LocalAddress[];

        !this.isAlreadyPersisted(parsed.address) &&
          this.setInStore(key, JSON.stringify([...stored, parsed]));
      }
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * @name remove
   * @summary Set the import flag of an address to `false`.
   */
  private static remove(task: IpcTask) {
    const { address, source, name } = task.data;
    const key = ConfigMain.getStorageKey(source);

    if (source === 'ledger') {
      // Remove stored ledger accounts
      const stored = this.getStoredAddresses(key, true) as LedgerLocalAddress[];
      const serialised = JSON.stringify(
        stored.map((a) =>
          a.address === address ? { ...a, name, isImported: false } : a
        )
      );

      this.setInStore(key, serialised);
    } else {
      // Remove stored vault or read-only account.
      const stored = this.getStoredAddresses(key) as LocalAddress[];
      const serialized = JSON.stringify(
        stored.map((a) =>
          a.address === address ? { ...a, name, isImported: false } : a
        )
      );

      this.setInStore(key, serialized);
    }
  }

  /**
   * @name rename
   * @summary Update a stored address' name.
   */
  private static rename(task: IpcTask) {
    const { source, address, newName } = task.data;
    const key = ConfigMain.getStorageKey(source);

    if (source === 'ledger') {
      // Rename ledger address data in store.
      const stored = this.getStoredAddresses(key, true) as LedgerLocalAddress[];
      const serialized = JSON.stringify(
        stored.map((a) => (a.address === address ? { ...a, name: newName } : a))
      );

      this.setInStore(key, serialized);
    } else {
      // Rename vault and read-only address data in store.
      const stored = this.getStoredAddresses(key) as LocalAddress[];
      const serialized = JSON.stringify(
        stored.map((a) => (a.address === address ? { ...a, name: newName } : a))
      );

      this.setInStore(key, serialized);
    }
  }

  private static getFromStore(key: string) {
    return (store as Record<string, AnyData>).get(key) as string;
  }

  private static setInStore(key: string, serialized: string) {
    (store as Record<string, AnyData>).set(key, serialized);
  }

  private static getStoredAddresses(
    key: string,
    ledger = false
  ): LedgerLocalAddress[] | LocalAddress[] {
    return ledger
      ? store.has(key)
        ? (JSON.parse(this.getFromStore(key)) as LedgerLocalAddress[])
        : ([] as LedgerLocalAddress[])
      : store.has(key)
        ? (JSON.parse(this.getFromStore(key)) as LocalAddress[])
        : ([] as LocalAddress[]);
  }

  /// Currently not used.
  private static throwIfExists(address: string) {
    if (this.isAlreadyPersisted(address)) {
      throw new Error(`Persist Error: Account ${address} already exists.`);
    }
  }

  private static isAlreadyPersisted(address: string): boolean {
    for (const source of [
      'ledger',
      'read-only',
      'vault',
      'wallet-connect',
    ] as AccountSource[]) {
      const key = ConfigMain.getStorageKey(source);
      if (source === 'ledger') {
        const stored = this.getStoredAddresses(key, true);
        if (stored.find((a) => a.address === address)) {
          return true;
        }
      } else {
        const stored = this.getStoredAddresses(key);
        if (stored.find((a) => a.address === address)) {
          return true;
        }
      }
    }

    return false;
  }
}
