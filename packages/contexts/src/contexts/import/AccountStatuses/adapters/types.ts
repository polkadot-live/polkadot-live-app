// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types';

export interface AccountStatusesAdapter {
  listenOnMount: (
    setStatusForAccount?: (
      key: string,
      source: AccountSource,
      status: boolean,
    ) => void,
    handleRemoveAddress?: (
      encodedAccount: EncodedAccount,
      genericAccount: ImportedGenericAccount,
    ) => Promise<void>,
  ) => (() => void) | null;
}
