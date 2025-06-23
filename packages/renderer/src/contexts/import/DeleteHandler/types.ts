// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';

export interface DeleteHandlerContextInterface {
  handleDeleteAddress: (
    genericAccount: ImportedGenericAccount
  ) => Promise<boolean>;
}
