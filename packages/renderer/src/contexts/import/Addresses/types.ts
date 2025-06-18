// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface AddressesContextInterface {
  getAccounts: (source: AccountSource) => ImportedGenericAccount[];
  handleAddressImport: (genericAccount: ImportedGenericAccount) => void;
  handleAddressDelete: (genericAccount: ImportedGenericAccount) => boolean;
  handleAddressUpdate: (genericAccount: ImportedGenericAccount) => void;
  isAlreadyImported: (targetPubKeyHex: string) => boolean;
}
