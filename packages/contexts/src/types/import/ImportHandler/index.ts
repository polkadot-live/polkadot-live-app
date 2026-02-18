// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
  LedgerMetadata,
} from '@polkadot-live/types/accounts';

export interface ImportHandlerContextInterface {
  handleImportAddress: (
    address: string,
    source: AccountSource,
    accountName?: string,
    ledgerMeta?: LedgerMetadata,
    showToast?: boolean,
  ) => Promise<void>;
  handleImportAddressFromBackup: (
    genericAccount: ImportedGenericAccount,
  ) => Promise<void>;
}
