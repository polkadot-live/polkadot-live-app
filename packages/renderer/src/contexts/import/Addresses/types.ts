// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface AddressesContextInterface {
  ledgerAddresses: ImportedGenericAccount[];
  readOnlyAddresses: ImportedGenericAccount[];
  vaultAddresses: ImportedGenericAccount[];
  wcAddresses: ImportedGenericAccount[];
  getAccounts: (source: AccountSource) => ImportedGenericAccount[];
  handleAddressImport: (genericAccount: ImportedGenericAccount) => void;
  handleAddressDelete: (source: AccountSource, publicKeyHex: string) => boolean;
  handleAddressRemove: (source: AccountSource, publicKeyHex: string) => void;
  handleAddressAdd: (source: AccountSource, publicKeyHex: string) => void;
  isAlreadyImported: (targetPubKeyHex: string) => boolean;
}
