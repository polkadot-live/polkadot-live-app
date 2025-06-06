// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from '@polkadot-live/types/accounts';

export interface AddHandlerContextInterface {
  handleAddAddress: (
    address: string,
    source: AccountSource,
    accountName: string
  ) => Promise<void>;
}
