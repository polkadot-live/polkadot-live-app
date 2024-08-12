// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource, LocalAddress } from '@/types/accounts';
import type { AnyData } from '@/types/misc';

export interface ImportHandlerContextInterface {
  handleImportAddress: (
    address: string,
    source: AccountSource,
    accountName: string,
    pubKey?: string,
    device?: AnyData
  ) => Promise<void>;
  handleImportAddressFromBackup: (imported: LocalAddress) => Promise<void>;
}
