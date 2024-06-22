// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from '@/types/accounts';

export interface ImportHandlerContextInterface {
  handleImportAddress: (
    address: string,
    source: AccountSource,
    accountName: string
  ) => void;
}
