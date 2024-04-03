// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from '@/types/accounts';

/**
 * @name Config
 * @summary Configuration class for the `import` window. Accessed in the import renderer.
 */
export class Config {
  // Cache the import window's message port to to facilitate communication to the `main` renderer.
  private static _portImport: MessagePort;

  // Local storage keys.
  private static _ledgerAddressesStorageKey = 'ledger_addresses';
  private static _vaultAddressesStorageKey = 'vault_addresses';
  private static _readOnlyAddressesStorageKey = 'read_only_addresses';

  // Return the local storage key for corresponding source addresses.
  static getStorageKey(source: AccountSource): string {
    switch (source) {
      case 'ledger': {
        return Config._ledgerAddressesStorageKey;
      }
      case 'vault': {
        return Config._vaultAddressesStorageKey;
      }
      case 'read-only': {
        return Config._readOnlyAddressesStorageKey;
      }
      default: {
        throw new Error('source not recognized');
      }
    }
  }

  // Get the `import` window's message port.
  static get portImport(): MessagePort {
    if (!Config._portImport) {
      throw new Error('_portImport still undefined.');
    }

    return Config._portImport;
  }

  // Set the `import` window's message port.
  static set portImport(port: MessagePort) {
    Config._portImport = port;
  }
}
