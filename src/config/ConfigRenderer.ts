// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from '@/types/accounts';

export class ConfigRenderer {
  // Cache the main or import window's message port.
  private static _portMain: MessagePort;
  private static _portImport: MessagePort;

  private static _ledgerAddressesStorageKey = 'ledger_addresses';
  private static _vaultAddressesStorageKey = 'vault_addresses';

  // Return the local storage key for corresponding source addresses.
  static getStorageKey(source: AccountSource): string {
    switch (source) {
      case 'ledger': {
        return ConfigRenderer._ledgerAddressesStorageKey;
      }
      case 'vault': {
        return ConfigRenderer._vaultAddressesStorageKey;
      }
      default: {
        throw new Error('source not recognized');
      }
    }
  }

  // Return the main window's message port.
  static get portMain(): MessagePort {
    if (!ConfigRenderer._portMain) {
      throw new Error('_portMain still undefined.');
    }

    return ConfigRenderer._portMain;
  }

  // Set the main window's message port.
  static set portMain(port: MessagePort) {
    ConfigRenderer._portMain = port;
  }

  // Return the import window's message port.
  static get portImport(): MessagePort {
    if (!ConfigRenderer._portImport) {
      throw new Error('_portImport still undefined.');
    }

    return ConfigRenderer._portImport;
  }

  // Set the import window's message port.
  static set portImport(port: MessagePort) {
    ConfigRenderer._portImport = port;
  }
}
