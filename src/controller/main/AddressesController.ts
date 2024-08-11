// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigMain } from '@/config/processes/main';
import { store } from '@/main';
import type { AnyData } from '@/types/misc';
import type { IpcTask } from '@/types/communication';
import type { LedgerLocalAddress, LocalAddress } from '@/types/accounts';

export class AddressesController {
  /**
   * @name add
   * @summary Set the import flag of an address to `true`.
   */
  static add(task: IpcTask) {
    const { source, address } = task.data;
    const key = ConfigMain.getStorageKey(source);

    if (source === 'ledger') {
      // Update ledger address.
      const stored: LedgerLocalAddress[] = store.has(key)
        ? JSON.parse(this.getFromStore(key))
        : [];

      this.setInStore(
        key,
        JSON.stringify(
          stored.map((a) =>
            a.address === address ? { ...a, isImported: true } : a
          )
        )
      );
    } else {
      // Update stored vault or read-only accounts.
      const stored: LocalAddress[] = store.has(key)
        ? JSON.parse(this.getFromStore(key))
        : [];

      this.setInStore(
        key,
        JSON.stringify(
          stored.map((a) =>
            a.address === address ? { ...a, isImported: true } : a
          )
        )
      );
    }
  }

  /**
   * @name delete
   * @summary Delete a received address' data from store.
   */
  static delete(task: IpcTask) {
    const { source, address } = task.data;
    const key = ConfigMain.getStorageKey(source);

    if (source === 'ledger') {
      // Update stored ledger accounts.
      const stored: LedgerLocalAddress[] = store.has(key)
        ? JSON.parse(this.getFromStore(key))
        : [];

      this.setInStore(
        key,
        JSON.stringify(stored.filter((a) => a.address !== address))
      );
    } else {
      // Update stored vault or read-only accounts.
      const stored: LocalAddress[] = store.has(key)
        ? JSON.parse(this.getFromStore(key))
        : [];

      this.setInStore(
        key,
        JSON.stringify(stored.filter((a) => a.address !== address))
      );
    }
  }

  /**
   * @name get
   * @summary Get all stored addresses for an account type.
   */
  static get(task: IpcTask): string {
    const { source } = task.data;
    const key = ConfigMain.getStorageKey(source);

    return store.has(key) ? this.getFromStore(key) : '[]';
  }

  /**
   * @name persist
   * @summary Persist received address data to store.
   */
  static persist(task: IpcTask) {
    const { source, serialized } = task.data;
    const key = ConfigMain.getStorageKey(source);

    if (source === 'ledger') {
      // Update stored ledger accounts.
      const parsed: LedgerLocalAddress = JSON.parse(serialized);
      const stored: LedgerLocalAddress[] = store.has(key)
        ? JSON.parse((store as Record<string, AnyData>).get(key) as string)
        : [];

      this.setInStore(key, JSON.stringify([...stored, parsed]));
    } else {
      // Update stored vault or read-only accounts.
      const parsed: LocalAddress = JSON.parse(serialized);
      const stored: LocalAddress[] = store.has(key)
        ? JSON.parse((store as Record<string, AnyData>).get(key) as string)
        : [];

      this.setInStore(key, JSON.stringify([...stored, parsed]));
    }
  }

  /**
   * @name remove
   * @summary Set the import flag of an address to `false`.
   */
  static remove(task: IpcTask) {
    const { source, address } = task.data;
    const key = ConfigMain.getStorageKey(source);

    if (source === 'ledger') {
      // Remove stored ledger accounts.
      const stored: LedgerLocalAddress[] = store.has(key)
        ? JSON.parse(this.getFromStore(key))
        : [];

      this.setInStore(
        key,
        JSON.stringify(
          stored.map((a) =>
            a.address === address ? { ...a, isImported: false } : a
          )
        )
      );
    } else {
      // Remove stored vault or read-only accounts.
      const stored: LocalAddress[] = store.has(key)
        ? JSON.parse(this.getFromStore(key))
        : [];

      this.setInStore(
        key,
        JSON.stringify(
          stored.map((a) =>
            a.address === address ? { ...a, isImported: false } : a
          )
        )
      );
    }
  }

  /**
   * @name rename
   * @summary Update a stored address' name.
   */
  static rename(task: IpcTask) {
    const { source, address, newName } = task.data;
    const key = ConfigMain.getStorageKey(source);

    if (source === 'ledger') {
      // Rename ledger address data in store.
      const stored: LedgerLocalAddress[] = store.has(key)
        ? JSON.parse(this.getFromStore(key))
        : [];

      this.setInStore(
        key,
        JSON.stringify(
          stored.map((a) =>
            a.address === address ? { ...a, name: newName } : a
          )
        )
      );
    } else {
      // Rename vault and read-only address data in store.
      const stored: LocalAddress[] = store.has(key)
        ? JSON.parse(this.getFromStore(key))
        : [];

      this.setInStore(
        key,
        JSON.stringify(
          stored.map((a) =>
            a.address === address ? { ...a, name: newName } : a
          )
        )
      );
    }
  }

  static getFromStore(key: string) {
    return (store as Record<string, AnyData>).get(key) as string;
  }

  static setInStore(key: string, serialized: string) {
    (store as Record<string, AnyData>).set(key, serialized);
  }
}
