// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ImportedGenericAccount } from '@polkadot-live/types';

export interface RenameHandlerAdapter {
  handleRename: (
    updatedAccount: ImportedGenericAccount,
    originalAccount: ImportedGenericAccount,
  ) => Promise<void>;
}
