// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource } from '@polkadot-live/types/accounts';

export interface DeleteHandlerContextInterface {
  handleDeleteAddress: (
    address: string,
    source: AccountSource
  ) => Promise<boolean>;
}
