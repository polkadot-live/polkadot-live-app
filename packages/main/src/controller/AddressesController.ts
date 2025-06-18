// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigMain } from '@/config/main';
import { store } from '@/main';
import type { AnyData } from '@polkadot-live/types/misc';
import type { IpcTask } from '@polkadot-live/types/communication';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export class AddressesController {
  /**
   * @name process
   * @summary Process an address IPC task.
   */
  static process(task: IpcTask): string | void {
    switch (task.action) {
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
      case 'raw-account:rename': {
        this.rename(task);
        break;
      }
      case 'raw-account:update': {
        this.update(task);
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
   * @name update
   * @summary Overwrite a persisted account with the received data.
   */
  private static update(task: IpcTask) {
    const account: ImportedGenericAccount = JSON.parse(task.data.serialized);
    const { publicKeyHex, source } = account;
    const key = ConfigMain.getStorageKey(source);
    const ser = JSON.stringify(
      this.getStoredAddresses(key).map((a) =>
        a.publicKeyHex === publicKeyHex ? account : a
      )
    );

    this.setInStore(key, ser);
  }

  /**
   * @name delete
   * @summary Delete a received address' data from store.
   */
  private static delete(task: IpcTask) {
    const { publicKeyHex, source } = task.data;
    const key = ConfigMain.getStorageKey(source);
    const ser = JSON.stringify(
      this.getStoredAddresses(key).filter(
        (a) => a.publicKeyHex !== publicKeyHex
      )
    );

    this.setInStore(key, ser);
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
      const fetched = this.getStoredAddresses(key);
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
  static getAllBySource(source: AccountSource): ImportedGenericAccount[] {
    const key = ConfigMain.getStorageKey(source);
    return this.getStoredAddresses(key);
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
    const { serialized } = task.data;
    const genericAccount: ImportedGenericAccount = JSON.parse(serialized);
    const { publicKeyHex } = genericAccount;

    if (this.isAlreadyPersisted(publicKeyHex)) {
      this.update({
        action: 'raw-account:update',
        data: { serialized: JSON.stringify(genericAccount) },
      });
    } else {
      this.persist({
        action: 'raw-account:persist',
        data: { serialized },
      });
    }
  }

  /**
   * @name persist
   * @summary Persist received address data to store.
   */
  private static persist(task: IpcTask) {
    try {
      const { serialized } = task.data;
      const genericAccount: ImportedGenericAccount = JSON.parse(serialized);
      const { source, publicKeyHex } = genericAccount;
      const key = ConfigMain.getStorageKey(source);

      if (!this.isAlreadyPersisted(publicKeyHex)) {
        const stored = this.getStoredAddresses(key);
        this.setInStore(key, JSON.stringify([...stored, genericAccount]));
      }
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * @name rename
   * @summary Update a stored address' name.
   */
  private static rename(task: IpcTask) {
    const { newName, publicKeyHex, source } = task.data;
    const key = ConfigMain.getStorageKey(source);
    const serialized = JSON.stringify(
      this.getStoredAddresses(key).map((a) =>
        a.publicKeyHex === publicKeyHex ? { ...a, accountName: newName } : a
      )
    );

    this.setInStore(key, serialized);
  }

  private static getFromStore(key: string) {
    return (store as Record<string, AnyData>).get(key) as string;
  }

  private static setInStore(key: string, serialized: string) {
    (store as Record<string, AnyData>).set(key, serialized);
  }

  private static getStoredAddresses(key: string): ImportedGenericAccount[] {
    return store.has(key) ? JSON.parse(this.getFromStore(key)) : [];
  }

  private static isAlreadyPersisted(publicKeyHex: string): boolean {
    for (const source of [
      'ledger',
      'read-only',
      'vault',
      'wallet-connect',
    ] as AccountSource[]) {
      const key = ConfigMain.getStorageKey(source);
      const stored = this.getStoredAddresses(key);

      if (stored.find((a) => a.publicKeyHex === publicKeyHex)) {
        return true;
      }
    }

    return false;
  }
}
