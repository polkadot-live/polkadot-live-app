// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { AnyData } from '@polkadot-live/types/misc';

export interface ImportHandlerContextInterface {
  handleImportAddress: (
    address: string,
    source: AccountSource,
    accountName?: string,
    device?: AnyData,
    showToast?: boolean
  ) => Promise<void>;
  handleImportAddressFromBackup: (
    genericAccount: ImportedGenericAccount
  ) => Promise<void>;
}
