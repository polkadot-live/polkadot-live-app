// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface ImportAddressesContextInterface {
  getAccounts: (source: AccountSource) => ImportedGenericAccount[];
  getDefaultName: () => string;
  getNextNames: (len: number) => string[];
  handleAddressImport: (genericAccount: ImportedGenericAccount) => void;
  handleAddressDelete: (genericAccount: ImportedGenericAccount) => boolean;
  handleAddressUpdate: (genericAccount: ImportedGenericAccount) => void;
  isAlreadyImported: (targetPubKeyHex: string) => boolean;
  isUniqueAccountName: (target: string) => boolean;
}
