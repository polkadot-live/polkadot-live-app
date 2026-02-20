// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSupportedSources } from '@polkadot-live/consts/chains';
import { AddressesRepository } from '../db';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IpcTask } from '@polkadot-live/types/communication';

export class AddressesController {
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

  // ===== Public =====

  // Get all stored addresses as serialized map.
  static getAll(): string {
    const map = new Map<AccountSource, string>();
    for (const source of getSupportedSources()) {
      const addresses = AddressesRepository.getBySource(source);
      map.set(source, JSON.stringify(addresses));
    }

    return JSON.stringify(Array.from(map.entries()));
  }

  // Get all addresses by source.
  static getAllBySource(source: AccountSource): ImportedGenericAccount[] {
    return AddressesRepository.getBySource(source);
  }

  // Get all serialized stored addresses.
  static getBackupData(): string {
    const map = new Map<AccountSource, string>();

    for (const source of getSupportedSources()) {
      const fetched = AddressesRepository.getBySource(source);
      if (fetched.length === 0) {
        continue;
      }
      map.set(source, JSON.stringify(fetched));
    }
    return JSON.stringify(Array.from(map.entries()));
  }

  // ===== Private =====

  // Delete an account.
  private static delete(task: IpcTask) {
    const { publicKeyHex } = task.data;
    AddressesRepository.delete(publicKeyHex);
  }

  // Persist an imported account.
  private static doImport(task: IpcTask) {
    const { serialized } = task.data;
    const genericAccount: ImportedGenericAccount = JSON.parse(serialized);
    AddressesRepository.upsert(genericAccount);
  }

  // Get accounts by source.
  private static get(task: IpcTask): string {
    const { source } = task.data;
    return JSON.stringify(AddressesRepository.getBySource(source));
  }

  // Returns an account's ledger metadata if exists.
  private static getLedgerMeta(task: IpcTask): string {
    interface Target {
      chainId: ChainID;
      publicKeyHex: string;
    }

    const { chainId, publicKeyHex }: Target = JSON.parse(task.data.serialized);
    const account = AddressesRepository.getByKey(publicKeyHex);

    const result = account
      ? account.encodedAccounts[chainId].ledgerMeta
      : undefined;

    return result ? JSON.stringify(result) : '';
  }

  // Persist received account.
  private static persist(task: IpcTask) {
    try {
      const { serialized } = task.data;
      const genericAccount: ImportedGenericAccount = JSON.parse(serialized);
      const { publicKeyHex } = genericAccount;

      if (!AddressesRepository.exists(publicKeyHex)) {
        AddressesRepository.upsert(genericAccount);
      }
    } catch (err) {
      console.log(err);
    }
  }

  // Overwrite an account.
  private static update(task: IpcTask) {
    const account: ImportedGenericAccount = JSON.parse(task.data.serialized);
    AddressesRepository.upsert(account);
  }
}
