// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSupportedSources } from '@polkadot-live/consts/chains';
import { Config as ConfigMain } from '../config/main';
import { store } from '../main';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { AnyData } from '@polkadot-live/types/misc';

export class AddressesController {
  /**
   * @name process
   * @summary Process an address IPC task.
   */
  static process(task: IpcTask): string | undefined {
    switch (task.action) {
      case 'raw-account:delete': {
        AddressesController.delete(task);
        break;
      }
      case 'raw-account:get': {
        return AddressesController.get(task);
      }
      case 'raw-account:get:ledger-meta': {
        return AddressesController.getLedgerMeta(task);
      }
      case 'raw-account:getAll': {
        return AddressesController.getAll();
      }
      case 'raw-account:persist': {
        AddressesController.persist(task);
        break;
      }
      case 'raw-account:import': {
        AddressesController.doImport(task);
        break;
      }
      case 'raw-account:update': {
        AddressesController.update(task);
        break;
      }
    }
  }

  /**
   * @name getAll
   * @summary Get all stored addresses and serialize as map.
   */
  static getAll(): string {
    const map = new Map<AccountSource, string>();
    for (const source of getSupportedSources()) {
      const key = ConfigMain.getStorageKey(source);
      const addresses = store.has(key)
        ? AddressesController.getFromStore(key)
        : '[]';
      map.set(source, addresses);
    }

    return JSON.stringify(Array.from(map.entries()));
  }

  /**
   * @name getLedgerMeta
   * @summary Returns an account's ledger metadata if it exists.
   */
  private static getLedgerMeta(task: IpcTask): string {
    interface Target {
      chainId: ChainID;
      publicKeyHex: string;
    }

    const { chainId, publicKeyHex }: Target = JSON.parse(task.data.serialized);
    const key = ConfigMain.getStorageKey('ledger');
    const account = AddressesController.getStoredAddresses(key).find(
      (a) => a.publicKeyHex === publicKeyHex,
    );

    const result = account
      ? account.encodedAccounts[chainId].ledgerMeta
      : undefined;

    return result ? JSON.stringify(result) : '';
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
      AddressesController.getStoredAddresses(key).map((a) =>
        a.publicKeyHex === publicKeyHex ? account : a,
      ),
    );

    AddressesController.setInStore(key, ser);
  }

  /**
   * @name delete
   * @summary Delete a received address' data from store.
   */
  private static delete(task: IpcTask) {
    const { publicKeyHex, source } = task.data;
    const key = ConfigMain.getStorageKey(source);
    const ser = JSON.stringify(
      AddressesController.getStoredAddresses(key).filter(
        (a) => a.publicKeyHex !== publicKeyHex,
      ),
    );

    AddressesController.setInStore(key, ser);
  }

  /**
   * @name getBackupData
   * @summary Get all stored addresses in serialized form.
   */
  static getBackupData(): string {
    const map = new Map<AccountSource, string>();

    for (const source of getSupportedSources()) {
      const key = ConfigMain.getStorageKey(source);
      const fetched = AddressesController.getStoredAddresses(key);
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
    return AddressesController.getStoredAddresses(key);
  }

  /**
   * @name get
   * @summary Get all stored addresses for an account type.
   */
  private static get(task: IpcTask): string {
    const { source } = task.data;
    const key = ConfigMain.getStorageKey(source);
    return store.has(key) ? AddressesController.getFromStore(key) : '[]';
  }

  /**
   * @name doImport
   * @summary Persist an address to store that's being imported from a backup file.
   */
  private static doImport(task: IpcTask) {
    const { serialized } = task.data;
    const genericAccount: ImportedGenericAccount = JSON.parse(serialized);
    const { publicKeyHex } = genericAccount;

    if (AddressesController.isAlreadyPersisted(publicKeyHex)) {
      AddressesController.update({
        action: 'raw-account:update',
        data: { serialized: JSON.stringify(genericAccount) },
      });
    } else {
      AddressesController.persist({
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

      if (!AddressesController.isAlreadyPersisted(publicKeyHex)) {
        const stored = AddressesController.getStoredAddresses(key);
        AddressesController.setInStore(
          key,
          JSON.stringify([...stored, genericAccount]),
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  private static getFromStore(key: string) {
    return (store as Record<string, AnyData>).get(key) as string;
  }

  private static setInStore(key: string, serialized: string) {
    (store as Record<string, AnyData>).set(key, serialized);
  }

  private static getStoredAddresses(key: string): ImportedGenericAccount[] {
    return store.has(key)
      ? JSON.parse(AddressesController.getFromStore(key))
      : [];
  }

  private static isAlreadyPersisted(publicKeyHex: string): boolean {
    for (const source of [
      'ledger',
      'read-only',
      'vault',
      'wallet-connect',
    ] as AccountSource[]) {
      const key = ConfigMain.getStorageKey(source);
      const stored = AddressesController.getStoredAddresses(key);

      if (stored.find((a) => a.publicKeyHex === publicKeyHex)) {
        return true;
      }
    }

    return false;
  }
}
